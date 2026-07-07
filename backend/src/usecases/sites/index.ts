import { VALID_DOMAIN, MAX_ZIP_BYTES, UsecaseResult, domainDir } from '../../shared/paths.ts';
import * as storage from '../../core/sites/storage.ts';
import * as analytics from '../../core/analytics/metrics.ts';

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

export async function listSites(user: string): Promise<Array<{ domain: string; enabled: boolean; hits: number; uptime: number | undefined; account?: string; subdomain?: string }>> {
  const domains = await storage.listDomains(user);
  return Promise.all(
    domains.map(async (domain) => {
      const data = await storage.readSiteMetadata(user, domain);
      return {
        domain,
        enabled: data?.enabled ?? false,
        hits: analytics.getTotalHits(domain),
        uptime: analytics.getUptimePct(domain),
        account: data?.account,
        subdomain: data?.subdomain,
      };
    })
  );
}

export async function listAllSites(): Promise<{ user: string; domain: string; enabled: boolean; hits: number; uptime: number | undefined; account?: string; subdomain?: string }[]> {
  const users = await storage.listUsers();
  const allSites: { user: string; domain: string; enabled: boolean; hits: number; uptime: number | undefined; account?: string; subdomain?: string }[] = [];
  
  for (const user of users) {
    const domains = await storage.listDomains(user);
    for (const domain of domains) {
      const data = await storage.readSiteMetadata(user, domain);
      allSites.push({
        user,
        domain,
        enabled: data?.enabled ?? false,
        hits: analytics.getTotalHits(domain),
        uptime: analytics.getUptimePct(domain),
        account: data?.account,
        subdomain: data?.subdomain,
      });
    }
  }
  
  return allSites;
}

export async function setSiteAccount(user: string, domain: string, account: string): Promise<void> {
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) return;
  data.account = account || undefined;
  await storage.writeSiteMetadata(user, domain, data);
}

export async function checkSite(user: string, domain: string): Promise<{ exists: boolean; enabled: boolean }> {
  const data = await storage.readSiteMetadata(user, domain);
  return {
    exists: !!data && data.currentIndex !== null,
    enabled: data?.enabled ?? false,
  };
}

export async function checkDomain(user: string, rawDomain: string): Promise<boolean> {
  const domain = rawDomain.replace(/\.petermichon\.fr$/, '');
  if (!VALID_DOMAIN.test(domain)) return false;
  const data = await storage.readSiteMetadata(user, domain);
  return !!data && data.currentIndex !== null;
}

export async function getSiteInfo(user: string, domain: string): Promise<{ enabled: boolean; subdomain?: string } | null> {
  const data = await storage.readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) return null;
  return { enabled: data.enabled, subdomain: data.subdomain };
}

export async function downloadActiveVersion(user: string, domain: string): Promise<{ file: Deno.FsFile; filename: string } | null> {
  const data = await storage.readSiteMetadata(user, domain);
  if (!data || !data.enabled || data.currentIndex === null) return null;
  const file = await storage.openActiveVersion(user, domain);
  if (!file) return null;
  return { file, filename: `${domain}.zip` };
}

export async function getSiteIcon(user: string, domain: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  const data = await storage.readSiteMetadata(user, domain);
  if (!data || !data.enabled || data.currentIndex === null) return null;

  const { readZip } = await import('../../shared/zip.ts');
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
export async function getSiteMeta(user: string, domain: string): Promise<{ subdomain?: string } | null> {
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) {
    return null;
  }
  return { subdomain: data.subdomain };
}

export async function updateSiteMeta(
  user: string,
  domain: string,
  updates: { subdomain?: string | undefined },
): Promise<UsecaseResult<void>> {
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

  await storage.writeSiteMetadata(user, domain, data);
  return { ok: true, value: undefined };
}

export async function getSiteRepos(user: string, domain: string): Promise<{ history: Array<{ repo: string; branch: string; lastUsed: number }> } | null> {
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

export async function getCustomDomains(user: string, domain: string): Promise<{ domain: string; verified: boolean }[]> {
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) return [];
  return data.customDomains ?? [];
}

export async function getAllCustomDomains(): Promise<{ user: string; siteDomain: string; customDomain: string; verified: boolean }[]> {
  const users = await storage.listUsers();
  const allCustomDomains: { user: string; siteDomain: string; customDomain: string; verified: boolean }[] = [];

  for (const user of users) {
    const domains = await storage.listDomains(user);
    for (const domain of domains) {
      const data = await storage.readSiteMetadata(user, domain);
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

export async function addCustomDomain(user: string, domain: string, customDomain: string): Promise<UsecaseResult<void>> {
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

export async function removeCustomDomain(user: string, domain: string, customDomain: string): Promise<UsecaseResult<void>> {
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

export async function verifyCustomDomain(user: string, domain: string, customDomain: string): Promise<UsecaseResult<{ verified: boolean }>> {
  const { verifyCustomDomain: dnsVerifyCustomDomain } = await import('./customDomains.ts');
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, error: 'Site not found', status: 404 };
  }
  
  if (!data.customDomains) {
    return { ok: false, error: 'Custom domain not found', status: 404 };
  }
  
  const entry = data.customDomains.find((e) => {
    return e.domain === customDomain;
  });
  if (!entry) {
    return { ok: false, error: 'Custom domain not found', status: 404 };
  }
  
  const isVerified = await dnsVerifyCustomDomain(domain, customDomain);
  entry.verified = isVerified;
  
  await storage.writeSiteMetadata(user, domain, data);
  invalidateCustomDomainCache();
  
  const verified = isVerified;
  return { ok: true, value: { verified } };
}

export async function getVerificationToken(domain: string): Promise<{ token: string }> {
  const { getVerificationToken: dnsGetToken } = await import('./customDomains.ts');
  const token = await dnsGetToken(domain);
  return { token };
}

export async function toggleSite(user: string, domain: string): Promise<UsecaseResult<{ enabled: boolean }>> {
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

export async function deleteSite(user: string, domain: string): Promise<void> {
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
      const stat = await Deno.stat(storage.versionPath(user, domain, index));
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

export async function downloadVersion(user: string, domain: string, index: number): Promise<{ file: Deno.FsFile; filename: string } | null> {
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  if (!(await storage.versionExists(user, domain, index))) return null;
  const file = await storage.openVersion(user, domain, index);
  return { file, filename: `${domain}-${index}.zip` };
}

export async function activateVersion(user: string, domain: string, index: number): Promise<UsecaseResult<void>> {
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
  await storage.deleteExtractedFiles(user, domain);
  return { ok: true, value: undefined };
}

export async function deleteVersion(user: string, domain: string, index: number): Promise<UsecaseResult<void>> {
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

export async function createSite(user: string, domain: string, zipData: Uint8Array): Promise<{ index: number }> {
  // Check if domain already exists
  const existingData = await storage.readSiteMetadata(user, domain);
  if (existingData) {
    throw new Error('Domain already exists for this user');
  }

  // Create initial site data
  const data = { ...storage.DEFAULT_DATA };
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  data.currentIndex = index;
  // Set default subdomain as username-domain
  data.subdomain = `${user}-${domain}`;

  // Create directories and files
  await Deno.mkdir(domainDir(user, domain), { recursive: true });
  await Deno.mkdir(storage.versionsDir(user, domain), { recursive: true });
  await Deno.writeFile(storage.versionPath(user, domain, index), zipData);
  await storage.writeSiteMetadata(user, domain, data);

  return { index };
}

export async function uploadVersion(user: string, domain: string, zipData: Uint8Array): Promise<{ index: number }> {
  // Check if domain exists
  const existingData = await storage.readSiteMetadata(user, domain);
  if (!existingData) {
    throw new Error('Site not found');
  }

  const data = existingData;
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };

  await Deno.mkdir(storage.versionsDir(user, domain), { recursive: true });
  await Deno.writeFile(storage.versionPath(user, domain, index), zipData);
  await storage.writeSiteMetadata(user, domain, data);

  return { index };
}

export async function createSiteFromGithub(user: string, domain: string, repo: string, ref: string): Promise<{ index: number; repo: string; branch: string }> {
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

  // Create initial site data
  const data = { ...storage.DEFAULT_DATA };
  data.repoHistory = [{ repo, branch: ref, lastUsed: Date.now() }];
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'github', repo, branch: ref }, createdAt: Date.now() };
  data.currentIndex = index;
  // Set default subdomain as username-domain
  data.subdomain = `${user}-${domain}`;

  // Create directories and files
  await Deno.mkdir(domainDir(user, domain), { recursive: true });
  await Deno.mkdir(storage.versionsDir(user, domain), { recursive: true });
  await Deno.writeFile(storage.versionPath(user, domain, index), zipData);
  await storage.writeSiteMetadata(user, domain, data);

  return { index, repo, branch: ref };
}

export async function uploadVersionFromGithub(user: string, domain: string, repo: string, ref: string): Promise<{ index: number; repo: string; branch: string }> {
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

  await Deno.mkdir(storage.versionsDir(user, domain), { recursive: true });
  await Deno.writeFile(storage.versionPath(user, domain, index), zipData);
  await storage.writeSiteMetadata(user, domain, data);

  return { index, repo, branch: ref };
}

export function recordPageHit(domain: string, ip: string): void {
  analytics.recordHit(domain, ip);
}

export async function serveSiteFile(user: string, domain: string, filePath: string): Promise<{ file: Deno.FsFile; contentType: string } | null> {
  const data = await storage.readSiteMetadata(user, domain);
  if (!data) return null;

  if (!(await storage.extractedSiteExists(user, domain))) {
    if (!data.enabled || data.currentIndex === null) return null;

    try {
      const { readZip } = await import('../../shared/zip.ts');
      const zipData = await storage.readActiveVersion(user, domain);
      if (!zipData) return null;
      const files = await readZip(zipData);
      await storage.extractFiles(user, domain, files);
    } catch {
      return null;
    }
  }

  const file = await storage.readExtractedFile(user, domain, filePath);
  if (!file) return null;

  const parts = filePath.split('.');
  const ext = parts.pop() ?? '';
  return { file, contentType: getContentType(ext) };
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
