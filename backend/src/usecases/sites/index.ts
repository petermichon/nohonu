import * as fs from 'node:fs/promises';
import * as dns from 'node:dns/promises';
import { VALID_DOMAIN, MAX_ZIP_BYTES, domainDir, coverImagePath } from '../../shared/paths.ts';
import { readZip } from '../../shared/zip.ts';
import { db } from '../../db.ts';
import * as sitesDb from '../../core/sites/db.ts';
import * as fsOps from '../../core/sites/fs.ts';
import * as paths from '../../core/sites/paths.ts';
import * as storage from '../../core/sites/storage.ts';
import * as analytics from '../../core/analytics/metrics.ts';
import { requireSession } from '../auth/require-session.ts';
import type { Result } from '../../shared/errors.ts';
import type { CustomDomain, PublicSiteSummary, RepoHistoryEntry, SiteSummary, VersionInfo, VersionSource } from './types.ts';

// Custom domain registry cache: Map<customDomain, internalDomain>
let customDomainCache: Map<string, string> | null = null;

async function buildCustomDomainCache(): Promise<void> {
  const cache = new Map<string, string>();
  // Need to iterate all users to build complete cache
  const users = await sitesDb.listUsers();
  
  for (const user of users) {
    const domains = await sitesDb.listDomains(user);
    for (const domain of domains) {
      const data = await sitesDb.readSiteMetadata(user, domain);
      if (data?.customDomains) {
        for (const entry of data.customDomains) {
          if (entry.verified) {
            cache.set(entry.domain, domain);
          }
        }
      }
    }
  }
  
  customDomainCache = cache;
}

export function invalidateCustomDomainCache(): void {
  customDomainCache = null;
}

export async function getCustomDomainCache(): Promise<Map<string, string>> {
  if (!customDomainCache) {
    await buildCustomDomainCache();
  }
  return customDomainCache as Map<string, string>;
}

// Helper: Find user that owns a domain
export async function findUserForDomain(domain: string): Promise<string | null> {
  const users = await sitesDb.listUsers();
  for (const user of users) {
    const domains = await sitesDb.listDomains(user);
    if (domains.includes(domain)) {
      return user;
    }
  }
  return null;
}

export async function listMySites(sessionId: string): Promise<Result<SiteSummary[]>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  return { ok: true, value: await listSites(user) };
}

export async function listSites(user: string): Promise<SiteSummary[]> {
  const [domains, userRecord] = await Promise.all([
    sitesDb.listDomains(user),
    db.user.findUnique({ where: { username: user }, select: { profilePicture: true } }),
  ]);
  const accountProfilePicture = userRecord?.profilePicture ?? undefined;
  return Promise.all(
    domains.map(async (domain) => {
      const data = await sitesDb.readSiteMetadata(user, domain);
      return {
        siteId: data?.siteId || domain,
        domain,
        enabled: data?.enabled ?? false,
        hits: analytics.getTotalHits(domain),
        uptime: analytics.getUptimePct(domain),
        account: data?.account,
        accountProfilePicture,
        displayName: data?.displayName,
        subdomain: data?.subdomain,
        coverImage: data?.coverImage,
        lastDeployedAt: data?.lastDeployedAt,
        starCount: data?.starCount,
        isStarred: data?.starredBy?.includes(user),
      };
    })
  );
}

export async function listAllSites(username?: string): Promise<PublicSiteSummary[]> {
  const users = await sitesDb.listUsers();
  const allSites: PublicSiteSummary[] = [];

  for (const user of users) {
    const [domains, userRecord] = await Promise.all([
      sitesDb.listDomains(user),
      db.user.findUnique({ where: { username: user }, select: { profilePicture: true } }),
    ]);
    const accountProfilePicture = userRecord?.profilePicture ?? undefined;
    for (const domain of domains) {
      const data = await sitesDb.readSiteMetadata(user, domain);
      allSites.push({
        user,
        siteId: data?.siteId || domain,
        domain,
        enabled: data?.enabled ?? false,
        hits: analytics.getTotalHits(domain),
        uptime: analytics.getUptimePct(domain),
        account: data?.account,
        accountProfilePicture,
        displayName: data?.displayName,
        subdomain: data?.subdomain,
        coverImage: data?.coverImage,
        lastDeployedAt: data?.lastDeployedAt,
        starCount: data?.starCount,
        isStarred: username ? data?.starredBy?.includes(username) : undefined,
      });
    }
  }

  return allSites;
}

export async function checkSite(user: string, domain: string): Promise<{ exists: boolean; enabled: boolean }> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  return {
    exists: !!data && data.currentIndex !== null,
    enabled: data?.enabled ?? false,
  };
}

export async function checkSubdomain(subdomain: string): Promise<boolean> {
  if (!subdomain || !VALID_DOMAIN.test(subdomain)) return false;
  const users = await sitesDb.listUsers();
  for (const user of users) {
    const domains = await sitesDb.listDomains(user);
    for (const domain of domains) {
      const data = await sitesDb.readSiteMetadata(user, domain);
      if (data?.subdomain === subdomain) return true;
    }
  }
  return false;
}

export async function checkDomain(user: string, rawDomain: string): Promise<boolean> {
  const domain = rawDomain.replace(/\.petermichon\.fr$/, '');
  if (!VALID_DOMAIN.test(domain)) return false;
  const data = await sitesDb.readSiteMetadata(user, domain);
  return !!data && data.currentIndex !== null;
}

export async function getMySiteInfo(
  sessionId: string,
  domain: string,
): Promise<Result<Awaited<ReturnType<typeof getSiteInfo>>>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  return { ok: true, value: await getSiteInfo(user, domain) };
}

export async function getSiteInfo(user: string, domain: string): Promise<{ enabled: boolean; subdomain?: string; siteId: string; displayName?: string; account?: string; coverImage?: string } | null> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) return null;
  return { enabled: data.enabled, subdomain: data.subdomain, siteId: data.siteId, displayName: data.displayName, account: data.account, coverImage: data.coverImage };
}

export async function downloadActiveVersion(user: string, domain: string): Promise<{ data: Uint8Array; filename: string } | null> {
  const meta = await sitesDb.readSiteMetadata(user, domain);
  if (!meta || !meta.enabled || meta.currentIndex === null) return null;
  const data = await storage.readActiveVersion(user, domain);
  if (!data) return null;
  return { data, filename: `${domain}.zip` };
}

export async function getSiteIcon(user: string, domain: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || !data.enabled || data.currentIndex === null) return null;

  const zipData = await storage.readActiveVersion(user, domain);
  if (!zipData) return null;

  const files = await readZip(zipData);

  const candidates = [
    { name: 'favicon.ico', type: 'image/x-icon' },
    { name: 'favicon.png', type: 'image/png' },
    { name: 'favicon.svg', type: 'image/svg+xml' },
  ];

  for (const { name, type } of candidates) {
    const fileData = files[name];
    if (fileData?.length) return { data: fileData, contentType: type };
  }

  return null;
}

export async function getSiteMeta(sessionId: string, domain: string): Promise<Result<{ subdomain?: string } | null>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: true, value: null };
  }
  return { ok: true, value: { subdomain: data.subdomain } };
}

export async function updateSiteMeta(
  sessionId: string,
  domain: string,
  updates: { subdomain?: string | undefined; displayName?: string | undefined },
): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  if (updates.subdomain !== undefined) {
    if (!VALID_DOMAIN.test(updates.subdomain)) {
      return { ok: false, code: 'invalid', message: 'Invalid subdomain' };
    }
    data.subdomain = updates.subdomain;
  }

  if (updates.displayName !== undefined) {
    data.displayName = updates.displayName || undefined;
  }

  await sitesDb.writeSiteMetadata(user, domain, data);
  return { ok: true, value: undefined };
}

export async function getSiteRepos(sessionId: string, domain: string): Promise<Result<{ history: RepoHistoryEntry[] } | null>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) return { ok: true, value: null };
  const history = data.repoHistory.map(({ repo, branch, lastUsed }) => ({ repo, branch, lastUsed }));
  return { ok: true, value: { history } };
}

export function getSiteStats(domain: string, slots: number, groupMinutes = 1): { slot: number; count: number }[] {
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof slots === 'number' && !isNaN(slots) && slots > 0, 'slots must be a positive number');
  console.assert(typeof groupMinutes === 'number' && !isNaN(groupMinutes) && groupMinutes > 0, 'groupMinutes must be a positive number');
  return analytics.getStats(domain, slots, groupMinutes);
}

export function getSiteVisitors(domain: string): { ip: string; count: number; last: number }[] {
  return analytics.getVisitors(domain);
}

export function getSiteUptime(domain: string, slots: number, groupMinutes = 1): { slot: number; up: boolean | undefined }[] {
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof slots === 'number' && !isNaN(slots) && slots > 0, 'slots must be a positive number');
  console.assert(typeof groupMinutes === 'number' && !isNaN(groupMinutes) && groupMinutes > 0, 'groupMinutes must be a positive number');
  return analytics.getUptime(domain, slots, groupMinutes);
}

export async function getCustomDomains(sessionId: string, domain: string): Promise<Result<CustomDomain[]>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) return { ok: true, value: [] };
  const customDomains = data.customDomains ?? [];
  return { ok: true, value: customDomains.map(({ domain: d, verified }) => ({ domain: d, verified })) };
}

export async function getAllCustomDomains(account?: string): Promise<{ user: string; siteDomain: string; customDomain: string; verified: boolean }[]> {
  const users = await sitesDb.listUsers();
  const allCustomDomains: { user: string; siteDomain: string; customDomain: string; verified: boolean }[] = [];

  for (const user of users) {
    const domains = await sitesDb.listDomains(user);
    for (const domain of domains) {
      const data = await sitesDb.readSiteMetadata(user, domain);
      if (account && data?.account !== account) continue;
      if (data?.customDomains) {
        for (const entry of data.customDomains) {
          allCustomDomains.push({
            user,
            siteDomain: domain,
            customDomain: entry.domain,
            verified: entry.verified,
          });
        }
      }
    }
  }

  return allCustomDomains;
}

export async function addCustomDomain(sessionId: string, domain: string, customDomain: string): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }
  
  if (!data.customDomains) {
    data.customDomains = [];
  }
  
  // Check for duplicate
  if (data.customDomains.some((entry) => { return entry.domain === customDomain; })) {
    return { ok: false, code: 'already_exists', message: 'Custom domain already exists' };
  }
  
  data.customDomains.push({ domain: customDomain, verified: false });
  await sitesDb.writeSiteMetadata(user, domain, data);
  invalidateCustomDomainCache();
  return { ok: true, value: undefined };
}

export async function removeCustomDomain(sessionId: string, domain: string, customDomain: string): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }
  
  if (!data.customDomains) {
    return { ok: false, code: 'not_found', message: 'Custom domain not found' };
  }
  
  const filtered = data.customDomains.filter((entry) => {
    return entry.domain !== customDomain;
  });
  if (filtered.length === data.customDomains.length) {
    return { ok: false, code: 'not_found', message: 'Custom domain not found' };
  }
  
  data.customDomains = filtered;
  await sitesDb.writeSiteMetadata(user, domain, data);
  invalidateCustomDomainCache();
  return { ok: true, value: undefined };
}

async function dnsVerifyCustomDomain(domain: string, customDomain: string): Promise<boolean> {
  const expectedToken = await generateVerificationToken(domain);
  const txtRecordName = `_nohonu.${customDomain}`;

  try {
    const records = await dns.resolveTxt(txtRecordName);
    if (!records || records.length === 0) return false;

    for (const record of records) {
      for (const value of record) {
        if (value === expectedToken) return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`DNS lookup failed for ${txtRecordName}:`, error);
    return false;
  }
}

async function generateVerificationToken(domain: string): Promise<string> {
  const data = new TextEncoder().encode(domain);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `nohonu-verify-${hashHex.substring(0, 16)}`;
}

export async function verifyCustomDomain(sessionId: string, domain: string, customDomain: string): Promise<Result<{ verified: boolean }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }
  
  if (!data.customDomains) {
    return { ok: false, code: 'not_found', message: 'Custom domain not found' };
  }
  
  const entry = data.customDomains.find((e) => e.domain === customDomain);
  if (!entry) {
    return { ok: false, code: 'not_found', message: 'Custom domain not found' };
  }
  
  const isVerified = await dnsVerifyCustomDomain(domain, customDomain);
  entry.verified = isVerified;
  
  await sitesDb.writeSiteMetadata(user, domain, data);
  invalidateCustomDomainCache();
  
  return { ok: true, value: { verified: isVerified } };
}

export async function getVerificationToken(domain: string): Promise<{ token: string }> {
  const token = await generateVerificationToken(domain);
  return { token };
}

export async function toggleSite(sessionId: string, domain: string): Promise<Result<{ enabled: boolean }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  data.enabled = !data.enabled;
  await sitesDb.writeSiteMetadata(user, domain, data);

  if (!data.enabled) await storage.deleteExtractedFiles(user, domain);

  const result = { enabled: data.enabled };
  return { ok: true, value: result };
}

export async function toggleStar(sessionId: string, domain: string, starred: boolean): Promise<Result<{ starred: boolean; starCount: number }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  // Find the user that owns this site
  const siteOwner = await findUserForDomain(domain);
  if (!siteOwner) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  const data = await sitesDb.readSiteMetadata(siteOwner, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  // Initialize arrays if not present
  if (!data.starredBy) {
    data.starredBy = [];
  }
  if (!data.starCount) {
    data.starCount = 0;
  }

  const isStarred = data.starredBy.includes(user);

  if (starred && !isStarred) {
    // Add star
    data.starredBy.push(user);
    data.starCount = data.starredBy.length;
  } else if (!starred && isStarred) {
    // Remove star
    data.starredBy = data.starredBy.filter((u) => u !== user);
    data.starCount = data.starredBy.length;
  }

  await sitesDb.writeSiteMetadata(siteOwner, domain, data);

  return { ok: true, value: { starred: data.starredBy.includes(user), starCount: data.starCount } };
}

export async function deleteSite(sessionId: string, domain: string): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  await storage.deleteSiteFiles(user, domain);
  analytics.clearDomain(domain);
  return { ok: true, value: undefined };
}

export async function listVersions(user: string, domain: string): Promise<{ versions: VersionInfo[]; current: number | null }> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) return { versions: [], current: null };

  const versions: VersionInfo[] = [];

  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    try {
      const stat = await fs.stat(paths.versionPath(user, domain, index));
      const source: VersionSource = entry.source.type === 'github'
        ? { type: 'github', repo: entry.source.repo, branch: entry.source.branch }
        : { type: 'upload' };
      versions.push({ index, size: stat.size, source, createdAt: entry.createdAt });
    } catch {
      // file missing, skip
    }
  }

  versions.sort((a, b) => {
    return b.index - a.index;
  });
  return { versions, current: data.currentIndex };
}

export async function downloadVersion(
  sessionId: string,
  domain: string,
  index: number,
): Promise<Result<{ data: Uint8Array; filename: string } | null>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  if (!(await fsOps.versionExists(user, domain, index))) return { ok: true, value: null };
  const data = await fsOps.readVersion(user, domain, index);
  return { ok: true, value: { data, filename: `${domain}-${index}.zip` } };
}

export async function activateVersion(sessionId: string, domain: string, index: number): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await fsOps.versionExists(user, domain, index);
  if (!exists) {
    return { ok: false, code: 'not_found', message: 'Version not found' };
  }
  const activated = await storage.setCurrentVersion(user, domain, index);
  if (!activated) {
    return { ok: false, code: 'internal', message: 'Failed to activate version' };
  }
  // Update lastDeployedAt
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (data) {
    data.lastDeployedAt = Date.now();
    await sitesDb.writeSiteMetadata(user, domain, data);
  }
  await storage.deleteExtractedFiles(user, domain);
  return { ok: true, value: undefined };
}

export async function deleteVersion(sessionId: string, domain: string, index: number): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await fsOps.versionExists(user, domain, index);
  if (!exists) {
    return { ok: false, code: 'not_found', message: 'Version not found' };
  }
  const deleted = await storage.deleteVersionFile(user, domain, index);
  if (!deleted) {
    return { ok: false, code: 'internal', message: 'Failed to delete version' };
  }
  return { ok: true, value: undefined };
}

export async function createSite(
  sessionId: string,
  domain: string,
  zipData: Uint8Array,
  subdomain?: string,
): Promise<Result<{ index: number; siteId: string }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;

  // Check if domain already exists
  const existingData = await sitesDb.readSiteMetadata(user, domain);
  if (existingData) {
    return { ok: false, code: 'already_exists', message: 'Domain already exists for this user' };
  }

  // Use user-domain as siteId for uniqueness across users
  const siteId = `${user}-${domain}`;

  // Create initial site data
  const data = { ...storage.DEFAULT_DATA };
  data.siteId = siteId;
  data.account = user;
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();
  data.subdomain = subdomain || `${user}-${domain}`;
  data.displayName = domain;

  await fs.mkdir(domainDir(user, domain), { recursive: true });
  await fs.mkdir(paths.versionsDir(user, domain), { recursive: true });
  await fs.writeFile(paths.versionPath(user, domain, index), zipData);
  await sitesDb.writeSiteMetadata(user, domain, data);

  return { ok: true, value: { index, siteId } };
}

export async function uploadVersion(sessionId: string, domain: string, zipData: Uint8Array): Promise<Result<{ index: number }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;

  // Check if domain exists
  const existingData = await sitesDb.readSiteMetadata(user, domain);
  if (!existingData) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  const data = existingData;
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();

  await fs.mkdir(paths.versionsDir(user, domain), { recursive: true });
  await fs.writeFile(paths.versionPath(user, domain, index), zipData);
  await sitesDb.writeSiteMetadata(user, domain, data);

  return { ok: true, value: { index } };
}

export async function createSiteFromGithub(
  sessionId: string,
  domain: string,
  repo: string,
  ref: string,
  subdomain?: string,
): Promise<Result<{ index: number; siteId: string; repo: string; branch: string }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;

  // Check if domain already exists
  const existingData = await sitesDb.readSiteMetadata(user, domain);
  if (existingData) {
    return { ok: false, code: 'already_exists', message: 'Domain already exists for this user' };
  }

  const githubUrl = `https://github.com/${repo}/archive/refs/heads/${ref}.zip`;

  let zipData: Uint8Array;
  try {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 30_000);
    const response = await fetch(githubUrl, { redirect: 'follow', signal: abort.signal });
    clearTimeout(timeout);

    if (response.status === 404) return { ok: false, code: 'not_found', message: 'Repository or branch not found' };
    if (!response.ok) return { ok: false, code: 'upstream_failed', message: `GitHub error: ${response.status}` };

    const rawBuffer = await response.arrayBuffer();
    if (rawBuffer.byteLength > MAX_ZIP_BYTES) {
      return { ok: false, code: 'invalid', message: `GitHub repo zip too large (max ${MAX_ZIP_BYTES} bytes)` };
    }
    zipData = new Uint8Array(rawBuffer);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, code: 'upstream_failed', message: 'GitHub request timed out' };
    }
    return { ok: false, code: 'upstream_failed', message: err instanceof Error ? err.message : 'Failed to fetch from GitHub' };
  }

  // Use user-domain as siteId for uniqueness across users
  const siteId = `${user}-${domain}`;

  // Create initial site data
  const data = { ...storage.DEFAULT_DATA };
  data.siteId = siteId;
  data.account = user;
  data.repoHistory = [{ repo, branch: ref, lastUsed: Date.now() }];
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'github', repo, branch: ref }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();
  data.subdomain = subdomain || `${user}-${domain}`;
  data.displayName = domain;

  await fs.mkdir(domainDir(user, domain), { recursive: true });
  await fs.mkdir(paths.versionsDir(user, domain), { recursive: true });
  await fs.writeFile(paths.versionPath(user, domain, index), zipData);
  await sitesDb.writeSiteMetadata(user, domain, data);

  return { ok: true, value: { index, siteId, repo, branch: ref } };
}

export async function uploadVersionFromGithub(
  sessionId: string,
  domain: string,
  repo: string,
  ref: string,
): Promise<Result<{ index: number; repo: string; branch: string }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;

  // Check if domain exists
  const existingData = await sitesDb.readSiteMetadata(user, domain);
  if (!existingData) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  const githubUrl = `https://github.com/${repo}/archive/refs/heads/${ref}.zip`;

  let zipData: Uint8Array;
  try {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 30_000);
    const response = await fetch(githubUrl, { redirect: 'follow', signal: abort.signal });
    clearTimeout(timeout);

    if (response.status === 404) return { ok: false, code: 'not_found', message: 'Repository or branch not found' };
    if (!response.ok) return { ok: false, code: 'upstream_failed', message: `GitHub error: ${response.status}` };

    const rawBuffer = await response.arrayBuffer();
    if (rawBuffer.byteLength > MAX_ZIP_BYTES) {
      return { ok: false, code: 'invalid', message: `GitHub repo zip too large (max ${MAX_ZIP_BYTES} bytes)` };
    }
    zipData = new Uint8Array(rawBuffer);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, code: 'upstream_failed', message: 'GitHub request timed out' };
    }
    return { ok: false, code: 'upstream_failed', message: err instanceof Error ? err.message : 'Failed to fetch from GitHub' };
  }

  const data = existingData;
  const filtered = data.repoHistory.filter((h) => {
    return !(h.repo === repo && h.branch === ref);
  });
  filtered.unshift({ repo, branch: ref, lastUsed: Date.now() });
  data.repoHistory = filtered.slice(0, 10);
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'github', repo, branch: ref }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();

  await fs.mkdir(paths.versionsDir(user, domain), { recursive: true });
  await fs.writeFile(paths.versionPath(user, domain, index), zipData);
  await sitesDb.writeSiteMetadata(user, domain, data);

  return { ok: true, value: { index, repo, branch: ref } };
}

export function recordPageHit(domain: string, ip: string): void {
  analytics.recordHit(domain, ip);
}

export function recordUptime(domain: string, up: boolean): void {
  analytics.recordUptime(domain, up);
}

export async function saveAnalytics(user: string, domain: string): Promise<void> {
  await analytics.saveAnalytics(user, domain);
}

export async function loadAnalytics(user: string, domain: string): Promise<void> {
  await analytics.loadAnalytics(user, domain);
}

export function resetAnalytics(): void {
  analytics.resetAnalytics();
}

export async function resetDatabase(): Promise<void> {
  await storage.resetStorage();
  resetAnalytics();
  invalidateCustomDomainCache();
}

export async function serveSiteFile(user: string, domain: string, filePath: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  const siteData = await sitesDb.readSiteMetadata(user, domain);
  if (!siteData) return null;

  if (!(await storage.extractedSiteExists(user, domain))) {
    if (!siteData.enabled || siteData.currentIndex === null) return null;

    try {
      const zipData = await storage.readActiveVersion(user, domain);
      if (!zipData) return null;
      const files = await readZip(zipData);
      await storage.extractFiles(user, domain, files);
    } catch {
      return null;
    }
  }

  const fileHandle = await fsOps.readExtractedFile(user, domain, filePath);
  if (!fileHandle) return null;

  const data = await fileHandle.readFile();
  await fileHandle.close();

  const parts = filePath.split('.');
  const ext = parts.pop() ?? '';
  return { data, contentType: getContentType(ext) };
}

export async function resolveDomainAndServe(host: string, path: string): Promise<{ user: string; domain: string; filePath: string } | null> {
  console.assert(typeof host === 'string' && host.length > 0, 'host must be a non-empty string');
  console.assert(typeof path === 'string', 'path must be a string');

  // Check custom domain registry first
  const cache = await getCustomDomainCache();
  const mappedDomain = cache.get(host);
  if (mappedDomain) {
    // Need to find which user owns this domain
    const users = await sitesDb.listUsers();
    for (const user of users) {
      const domains = await sitesDb.listDomains(user);
      if (domains.includes(mappedDomain)) {
        const filePath = path === '/' ? '/index.html' : path;
        return { user, domain: mappedDomain, filePath };
      }
    }
  }

  // Check for subdomain-based routing
  const subdomainMatch = host.match(/^([^.]+)\./);
  if (subdomainMatch && subdomainMatch[1] && !['www'].includes(subdomainMatch[1])) {
    const subdomain = subdomainMatch[1];
    // Find which site has this subdomain in its metadata
    const users = await sitesDb.listUsers();
    for (const user of users) {
      const domains = await sitesDb.listDomains(user);
      for (const domain of domains) {
        const info = await sitesDb.readSiteMetadata(user, domain);
        if (info && info.subdomain === subdomain && info.currentIndex !== null) {
          const filePath = path === '/' ? '/index.html' : path;
          return { user, domain, filePath };
        }
      }
    }
  }

  if (path.length > 1) {
    const parts = path.split('/').filter(Boolean);
    const potential = parts[0];
    if (potential && VALID_DOMAIN.test(potential)) {
      const users = await sitesDb.listUsers();
      for (const user of users) {
        const domains = await sitesDb.listDomains(user);
        if (domains.includes(potential)) {
          const info = await sitesDb.readSiteMetadata(user, potential);
          if (info && info.currentIndex !== null) {
            const domain = potential;
            const rest = parts.slice(1).join('/');
            const filePath = rest !== '' ? '/' + rest : '/index.html';
            return { user, domain, filePath };
          }
        }
      }
    }
  }

  return null;
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
  };
  return types[ext] ?? 'application/octet-stream';
}

export async function getSiteCover(user: string, domain: string): Promise<Uint8Array | null> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || !data.coverImage) return null;

  try {
    return await fs.readFile(coverImagePath(user, domain));
  } catch {
    return null;
  }
}

export async function uploadSiteCover(sessionId: string, domain: string, imageData: Uint8Array): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  try {
    await fs.writeFile(coverImagePath(user, domain), imageData);
    data.coverImage = 'cover.jpg';
    await sitesDb.writeSiteMetadata(user, domain, data);
    return { ok: true, value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, code: 'internal', message: `Failed to save cover image: ${message}` };
  }
}

export async function deleteSiteCover(sessionId: string, domain: string): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  try {
    await fs.rm(coverImagePath(user, domain), { force: true });
  } catch {
    // File might not exist, that's ok
  }

  data.coverImage = undefined;
  await sitesDb.writeSiteMetadata(user, domain, data);
  return { ok: true, value: undefined };
}
