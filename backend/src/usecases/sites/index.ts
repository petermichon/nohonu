import * as fs from 'node:fs/promises';
import * as dns from 'node:dns/promises';
import { VALID_DOMAIN, MAX_ZIP_BYTES, UsecaseResult, domainDir, coverImagePath } from '../../shared/paths.ts';
import { readZip } from '../../shared/zip.ts';
import * as storage from '../../core/sites/storage.ts';
import * as analytics from '../../core/analytics/metrics.ts';
import { db } from '../../db.ts';
import { requireSession } from '../../core/auth/requireSession.ts';

// Custom domain registry cache: Map<customDomain, internalDomain>
let customDomainCache: Map<string, string> | null = null;

async function buildCustomDomainCache(): Promise<void> {
  const cache = new Map<string, string>();
  // Need to iterate all users to build complete cache
  const users = await storage.listUsers();
  
  for (const user of users) {
    const domains = await storage.listDomains(user);
    for (const domain of domains) {
      const data = await storage.readSiteMetadata(user, domain);
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
  const users = await storage.listUsers();
  for (const user of users) {
    const domains = await storage.listDomains(user);
    if (domains.includes(domain)) {
      return user;
    }
  }
  return null;
}

export async function listMySites(sessionId: string): Promise<Awaited<ReturnType<typeof listSites>>> {
  const user = await requireSession(sessionId);
  return listSites(user);
}

export async function listSites(user: string): Promise<Array<{ siteId: string; domain: string; enabled: boolean; hits: number; uptime: number | undefined; account?: string; displayName?: string; subdomain?: string; coverImage?: string; lastDeployedAt?: number; starCount?: number; isStarred?: boolean }>> {
  const domains = await storage.listDomains(user);
  return Promise.all(
    domains.map(async (domain) => {
      const data = await storage.readSiteMetadata(user, domain);
      return {
        siteId: data?.siteId || domain,
        domain,
        enabled: data?.enabled ?? false,
        hits: analytics.getTotalHits(domain),
        uptime: analytics.getUptimePct(domain),
        account: data?.account,
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

export async function listAllSites(username?: string): Promise<{ user: string; siteId: string; domain: string; enabled: boolean; hits: number; uptime: number | undefined; account?: string; displayName?: string; subdomain?: string; coverImage?: string; lastDeployedAt?: number; starCount?: number; isStarred?: boolean }[]> {
  const users = await storage.listUsers();
  const allSites: { user: string; siteId: string; domain: string; enabled: boolean; hits: number; uptime: number | undefined; account?: string; displayName?: string; subdomain?: string; coverImage?: string; lastDeployedAt?: number; starCount?: number; isStarred?: boolean }[] = [];

  for (const user of users) {
    const domains = await storage.listDomains(user);
    for (const domain of domains) {
      const data = await storage.readSiteMetadata(user, domain);
      allSites.push({
        user,
        siteId: data?.siteId || domain,
        domain,
        enabled: data?.enabled ?? false,
        hits: analytics.getTotalHits(domain),
        uptime: analytics.getUptimePct(domain),
        account: data?.account,
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

export async function listStarredSites(username: string): Promise<{ user: string; domain: string; displayName?: string; coverImage?: string; starCount?: number }[]> {
  const starred = await db.starredBy.findMany({
    where: { username },
    include: { site: { select: { userUsername: true, domain: true, displayName: true, coverImage: true, starCount: true } } },
  });
  return starred.map((s) => ({
    user: s.site.userUsername,
    domain: s.site.domain,
    displayName: s.site.displayName ?? undefined,
    coverImage: s.site.coverImage ?? undefined,
    starCount: s.site.starCount,
  }));
}

export async function checkSite(user: string, domain: string): Promise<{ exists: boolean; enabled: boolean }> {
  const data = await storage.readSiteMetadata(user, domain);
  return {
    exists: !!data && data.currentIndex !== null,
    enabled: data?.enabled ?? false,
  };
}

export async function checkSubdomain(subdomain: string): Promise<boolean> {
  if (!subdomain || !VALID_DOMAIN.test(subdomain)) return false;
  const users = await storage.listUsers();
  for (const user of users) {
    const domains = await storage.listDomains(user);
    for (const domain of domains) {
      const data = await storage.readSiteMetadata(user, domain);
      if (data?.subdomain === subdomain) return true;
    }
  }
  return false;
}

export async function checkDomain(user: string, rawDomain: string): Promise<boolean> {
  const domain = rawDomain.replace(/\.petermichon\.fr$/, '');
  if (!VALID_DOMAIN.test(domain)) return false;
  const data = await storage.readSiteMetadata(user, domain);
  return !!data && data.currentIndex !== null;
}

export async function getMySiteInfo(sessionId: string, domain: string): Promise<Awaited<ReturnType<typeof getSiteInfo>>> {
  const user = await requireSession(sessionId);
  return getSiteInfo(user, domain);
}

export async function getSiteInfo(user: string, domain: string): Promise<{ enabled: boolean; subdomain?: string; siteId: string; displayName?: string; account?: string; coverImage?: string } | null> {
  const data = await storage.readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) return null;
  return { enabled: data.enabled, subdomain: data.subdomain, siteId: data.siteId, displayName: data.displayName, account: data.account, coverImage: data.coverImage };
}

export async function downloadActiveVersion(user: string, domain: string): Promise<{ data: Uint8Array; filename: string } | null> {
  const meta = await storage.readSiteMetadata(user, domain);
  if (!meta || !meta.enabled || meta.currentIndex === null) return null;
  const data = await storage.readActiveVersion(user, domain);
  if (!data) return null;
  return { data, filename: `${domain}.zip` };
}

export async function getSiteIcon(user: string, domain: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  const data = await storage.readSiteMetadata(user, domain);
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

// Get site metadata
export async function getSiteMeta(sessionId: string, domain: string): Promise<{ subdomain?: string } | null> {
  const user = await requireSession(sessionId);
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) {
    return null;
  }
  return { subdomain: data.subdomain };
}

export async function updateSiteMeta(
  sessionId: string,
  domain: string,
  updates: { subdomain?: string | undefined; displayName?: string | undefined },
): Promise<UsecaseResult<void>> {
  const user = await requireSession(sessionId);
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, error: 'Site not found', status: 404 };
  }

  if (updates.subdomain !== undefined) {
    if (!VALID_DOMAIN.test(updates.subdomain)) {
      return { ok: false, error: 'Invalid subdomain', status: 400 };
    }
    data.subdomain = updates.subdomain;
  }

  if (updates.displayName !== undefined) {
    data.displayName = updates.displayName || undefined;
  }

  await storage.writeSiteMetadata(user, domain, data);
  return { ok: true, value: undefined };
}

export async function getSiteRepos(sessionId: string, domain: string): Promise<{ history: Array<{ repo: string; branch: string; lastUsed: number }> } | null> {
  const user = await requireSession(sessionId);
  const data = await storage.readSiteMetadata(user, domain);
  return data ? { history: data.repoHistory } : null;
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

export async function getCustomDomains(sessionId: string, domain: string): Promise<{ domain: string; verified: boolean }[]> {
  const user = await requireSession(sessionId);
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) return [];
  return data.customDomains ?? [];
}

export async function getAllCustomDomains(account?: string): Promise<{ user: string; siteDomain: string; customDomain: string; verified: boolean }[]> {
  const users = await storage.listUsers();
  const allCustomDomains: { user: string; siteDomain: string; customDomain: string; verified: boolean }[] = [];

  for (const user of users) {
    const domains = await storage.listDomains(user);
    for (const domain of domains) {
      const data = await storage.readSiteMetadata(user, domain);
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

export async function addCustomDomain(sessionId: string, domain: string, customDomain: string): Promise<UsecaseResult<void>> {
  const user = await requireSession(sessionId);
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, error: 'Site not found', status: 404 };
  }
  
  if (!data.customDomains) {
    data.customDomains = [];
  }
  
  // Check for duplicate
  if (data.customDomains.some((entry) => { return entry.domain === customDomain; })) {
    return { ok: false, error: 'Custom domain already exists', status: 409 };
  }
  
  data.customDomains.push({ domain: customDomain, verified: false });
  await storage.writeSiteMetadata(user, domain, data);
  invalidateCustomDomainCache();
  return { ok: true, value: undefined };
}

export async function removeCustomDomain(sessionId: string, domain: string, customDomain: string): Promise<UsecaseResult<void>> {
  const user = await requireSession(sessionId);
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, error: 'Site not found', status: 404 };
  }
  
  if (!data.customDomains) {
    return { ok: false, error: 'Custom domain not found', status: 404 };
  }
  
  const filtered = data.customDomains.filter((entry) => {
    return entry.domain !== customDomain;
  });
  if (filtered.length === data.customDomains.length) {
    return { ok: false, error: 'Custom domain not found', status: 404 };
  }
  
  data.customDomains = filtered;
  await storage.writeSiteMetadata(user, domain, data);
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

export async function verifyCustomDomain(sessionId: string, domain: string, customDomain: string): Promise<UsecaseResult<{ verified: boolean }>> {
  const user = await requireSession(sessionId);
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, error: 'Site not found', status: 404 };
  }
  
  if (!data.customDomains) {
    return { ok: false, error: 'Custom domain not found', status: 404 };
  }
  
  const entry = data.customDomains.find((e) => e.domain === customDomain);
  if (!entry) {
    return { ok: false, error: 'Custom domain not found', status: 404 };
  }
  
  const isVerified = await dnsVerifyCustomDomain(domain, customDomain);
  entry.verified = isVerified;
  
  await storage.writeSiteMetadata(user, domain, data);
  invalidateCustomDomainCache();
  
  return { ok: true, value: { verified: isVerified } };
}

export async function getVerificationToken(domain: string): Promise<{ token: string }> {
  const token = await generateVerificationToken(domain);
  return { token };
}

export async function toggleSite(sessionId: string, domain: string): Promise<UsecaseResult<{ enabled: boolean }>> {
  const user = await requireSession(sessionId);
  const data = await storage.readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) {
    return { ok: false, error: 'Site not found', status: 404 };
  }

  data.enabled = !data.enabled;
  await storage.writeSiteMetadata(user, domain, data);

  if (!data.enabled) await storage.deleteExtractedFiles(user, domain);

  const result = { enabled: data.enabled };
  return { ok: true, value: result };
}

export async function toggleStar(sessionId: string, domain: string, starred: boolean): Promise<UsecaseResult<{ starred: boolean; starCount: number }>> {
  const user = await requireSession(sessionId);
  // Find the user that owns this site
  const siteOwner = await findUserForDomain(domain);
  if (!siteOwner) {
    return { ok: false, error: 'Site not found', status: 404 };
  }

  const data = await storage.readSiteMetadata(siteOwner, domain);
  if (!data) {
    return { ok: false, error: 'Site not found', status: 404 };
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

  await storage.writeSiteMetadata(siteOwner, domain, data);

  return { ok: true, value: { starred: data.starredBy.includes(user), starCount: data.starCount } };
}

export async function deleteSite(sessionId: string, domain: string): Promise<void> {
  const user = await requireSession(sessionId);
  await storage.deleteSiteFiles(user, domain);
  analytics.clearDomain(domain);
}

export async function listVersions(user: string, domain: string): Promise<{ versions: Array<{ index: number; size: number; source: { type: 'upload' } | { type: 'github'; repo: string; branch: string }; createdAt: number }>; current: number | null }> {
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) return { versions: [], current: null };

  const versions = [];

  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    try {
      const stat = await fs.stat(storage.versionPath(user, domain, index));
      versions.push({ index, size: stat.size, source: entry.source, createdAt: entry.createdAt });
    } catch {
      // file missing, skip
    }
  }

  versions.sort((a, b) => {
    return b.index - a.index;
  });
  return { versions, current: data.currentIndex };
}

export async function downloadVersion(sessionId: string, domain: string, index: number): Promise<{ data: Uint8Array; filename: string } | null> {
  const user = await requireSession(sessionId);
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  if (!(await storage.versionExists(user, domain, index))) return null;
  const data = await storage.readVersion(user, domain, index);
  return { data, filename: `${domain}-${index}.zip` };
}

export async function activateVersion(sessionId: string, domain: string, index: number): Promise<UsecaseResult<void>> {
  const user = await requireSession(sessionId);
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await storage.versionExists(user, domain, index);
  if (!exists) {
    return { ok: false, error: 'Version not found', status: 404 };
  }
  const activated = await storage.setCurrentVersion(user, domain, index);
  if (!activated) {
    return { ok: false, error: 'Failed to activate version', status: 500 };
  }
  // Update lastDeployedAt
  const data = await storage.readSiteMetadata(user, domain);
  if (data) {
    data.lastDeployedAt = Date.now();
    await storage.writeSiteMetadata(user, domain, data);
  }
  await storage.deleteExtractedFiles(user, domain);
  return { ok: true, value: undefined };
}

export async function deleteVersion(sessionId: string, domain: string, index: number): Promise<UsecaseResult<void>> {
  const user = await requireSession(sessionId);
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await storage.versionExists(user, domain, index);
  if (!exists) {
    return { ok: false, error: 'Version not found', status: 404 };
  }
  const deleted = await storage.deleteVersionFile(user, domain, index);
  if (!deleted) {
    return { ok: false, error: 'Failed to delete version', status: 500 };
  }
  return { ok: true, value: undefined };
}

export async function createSite(sessionId: string, domain: string, zipData: Uint8Array, subdomain?: string): Promise<{ index: number; siteId: string }> {
  const user = await requireSession(sessionId);
  // Check if domain already exists
  const existingData = await storage.readSiteMetadata(user, domain);
  if (existingData) {
    throw new Error('Domain already exists for this user');
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
  await fs.mkdir(storage.versionsDir(user, domain), { recursive: true });
  await fs.writeFile(storage.versionPath(user, domain, index), zipData);
  await storage.writeSiteMetadata(user, domain, data);

  return { index, siteId };
}

export async function uploadVersion(sessionId: string, domain: string, zipData: Uint8Array): Promise<{ index: number }> {
  const user = await requireSession(sessionId);
  // Check if domain exists
  const existingData = await storage.readSiteMetadata(user, domain);
  if (!existingData) {
    throw new Error('Site not found');
  }

  const data = existingData;
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();

  await fs.mkdir(storage.versionsDir(user, domain), { recursive: true });
  await fs.writeFile(storage.versionPath(user, domain, index), zipData);
  await storage.writeSiteMetadata(user, domain, data);

  return { index };
}

export async function createSiteFromGithub(sessionId: string, domain: string, repo: string, ref: string, subdomain?: string): Promise<{ index: number; siteId: string; repo: string; branch: string }> {
  const user = await requireSession(sessionId);
  // Check if domain already exists
  const existingData = await storage.readSiteMetadata(user, domain);
  if (existingData) {
    throw new Error('Domain already exists for this user');
  }

  const githubUrl = `https://github.com/${repo}/archive/refs/heads/${ref}.zip`;

  let zipData: Uint8Array;
  try {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 30_000);
    const response = await fetch(githubUrl, { redirect: 'follow', signal: abort.signal });
    clearTimeout(timeout);

    if (response.status === 404) throw new Error('Repository or branch not found');
    if (!response.ok) throw new Error(`GitHub error: ${response.status}`);

    const rawBuffer = await response.arrayBuffer();
    if (rawBuffer.byteLength > MAX_ZIP_BYTES) {
      throw new Error(`GitHub repo zip too large (max ${MAX_ZIP_BYTES} bytes)`);
    }
    zipData = new Uint8Array(rawBuffer);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw new Error('GitHub request timed out');
    throw err;
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
  await fs.mkdir(storage.versionsDir(user, domain), { recursive: true });
  await fs.writeFile(storage.versionPath(user, domain, index), zipData);
  await storage.writeSiteMetadata(user, domain, data);

  return { index, siteId, repo, branch: ref };
}

export async function uploadVersionFromGithub(sessionId: string, domain: string, repo: string, ref: string): Promise<{ index: number; repo: string; branch: string }> {
  const user = await requireSession(sessionId);
  // Check if domain exists
  const existingData = await storage.readSiteMetadata(user, domain);
  if (!existingData) {
    throw new Error('Site not found');
  }

  const githubUrl = `https://github.com/${repo}/archive/refs/heads/${ref}.zip`;

  let zipData: Uint8Array;
  try {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 30_000);
    const response = await fetch(githubUrl, { redirect: 'follow', signal: abort.signal });
    clearTimeout(timeout);

    if (response.status === 404) throw new Error('Repository or branch not found');
    if (!response.ok) throw new Error(`GitHub error: ${response.status}`);

    const rawBuffer = await response.arrayBuffer();
    if (rawBuffer.byteLength > MAX_ZIP_BYTES) {
      throw new Error(`GitHub repo zip too large (max ${MAX_ZIP_BYTES} bytes)`);
    }
    zipData = new Uint8Array(rawBuffer);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw new Error('GitHub request timed out');
    throw err;
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

  await fs.mkdir(storage.versionsDir(user, domain), { recursive: true });
  await fs.writeFile(storage.versionPath(user, domain, index), zipData);
  await storage.writeSiteMetadata(user, domain, data);

  return { index, repo, branch: ref };
}

export function recordPageHit(domain: string, ip: string): void {
  analytics.recordHit(domain, ip);
}

export async function serveSiteFile(user: string, domain: string, filePath: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  const siteData = await storage.readSiteMetadata(user, domain);
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

  const fileHandle = await storage.readExtractedFile(user, domain, filePath);
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
    const users = await storage.listUsers();
    for (const user of users) {
      const domains = await storage.listDomains(user);
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
    const users = await storage.listUsers();
    for (const user of users) {
      const domains = await storage.listDomains(user);
      for (const domain of domains) {
        const info = await storage.readSiteMetadata(user, domain);
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
      const users = await storage.listUsers();
      for (const user of users) {
        const domains = await storage.listDomains(user);
        if (domains.includes(potential)) {
          const info = await storage.readSiteMetadata(user, potential);
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
  const data = await storage.readSiteMetadata(user, domain);
  if (!data || !data.coverImage) return null;

  try {
    return await fs.readFile(coverImagePath(user, domain));
  } catch {
    return null;
  }
}

export async function uploadSiteCover(sessionId: string, domain: string, imageData: Uint8Array): Promise<UsecaseResult<void>> {
  const user = await requireSession(sessionId);
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, error: 'Site not found', status: 404 };
  }

  try {
    await fs.writeFile(coverImagePath(user, domain), imageData);
    data.coverImage = 'cover.jpg';
    await storage.writeSiteMetadata(user, domain, data);
    return { ok: true, value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Failed to save cover image: ${message}`, status: 500 };
  }
}

export async function deleteSiteCover(sessionId: string, domain: string): Promise<UsecaseResult<void>> {
  const user = await requireSession(sessionId);
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, error: 'Site not found', status: 404 };
  }

  try {
    await fs.rm(coverImagePath(user, domain), { force: true });
  } catch {
    // File might not exist, that's ok
  }

  data.coverImage = undefined;
  await storage.writeSiteMetadata(user, domain, data);
  return { ok: true, value: undefined };
}
