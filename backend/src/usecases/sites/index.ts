import { VALID_DOMAIN, MAX_ZIP_BYTES, UsecaseResult } from '../../shared/paths.ts';
import * as storage from '../../core/sites/storage.ts';
import * as analytics from '../../core/analytics/metrics.ts';

// Custom domain registry cache: Map<customDomain, internalDomain>
let customDomainCache: Map<string, string> | null = null;

async function buildCustomDomainCache(): Promise<void> {
  const cache = new Map<string, string>();
  const domains = await storage.listDomains();
  
  for (const domain of domains) {
    const data = await storage.readSiteMetadata(domain);
    if (data?.customDomains) {
      for (const entry of data.customDomains) {
        if (entry.verified) {
          cache.set(entry.domain, domain);
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

export async function listSites(): Promise<Array<{ domain: string; enabled: boolean; hits: number; uptime: number | undefined; accent?: string }>> {
  const domains = await storage.listDomains();
  return Promise.all(
    domains.map(async (domain) => {
      const data = await storage.readSiteMetadata(domain);
      return {
        domain,
        enabled: data?.enabled ?? false,
        hits: analytics.getTotalHits(domain),
        uptime: analytics.getUptimePct(domain),
        accent: data?.accent,
      };
    })
  );
}

export async function checkSite(domain: string): Promise<{ exists: boolean; enabled: boolean }> {
  const data = await storage.readSiteMetadata(domain);
  return {
    exists: !!data && data.currentIndex !== null,
    enabled: data?.enabled ?? false,
  };
}

export async function checkDomain(rawDomain: string): Promise<boolean> {
  const domain = rawDomain.replace(/\.petermichon\.fr$/, '');
  if (!VALID_DOMAIN.test(domain)) return false;
  const data = await storage.readSiteMetadata(domain);
  return !!data && data.currentIndex !== null;
}

export async function getSiteInfo(domain: string): Promise<{ enabled: boolean } | null> {
  const data = await storage.readSiteMetadata(domain);
  if (!data || data.currentIndex === null) return null;
  return { enabled: data.enabled };
}

export async function downloadActiveVersion(domain: string): Promise<{ file: Deno.FsFile; filename: string } | null> {
  const data = await storage.readSiteMetadata(domain);
  if (!data || !data.enabled || data.currentIndex === null) return null;
  const file = await storage.openActiveVersion(domain);
  if (!file) return null;
  return { file, filename: `${domain}.zip` };
}

export async function getSiteIcon(domain: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  const data = await storage.readSiteMetadata(domain);
  if (!data || !data.enabled || data.currentIndex === null) return null;

  const { readZip } = await import('../../shared/zip.ts');
  const zipData = await storage.readActiveVersion(domain);
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

// Get site metadata (accent color)
export async function getSiteMeta(domain: string): Promise<{ accent?: string } | null> {
  const data = await storage.readSiteMetadata(domain);
  if (!data) {
    return null;
  }
  return { accent: data.accent };
}

export async function updateSiteMeta(
  domain: string,
  updates: { accent?: string | undefined },
): Promise<UsecaseResult<void>> {
  const data = await storage.readSiteMetadata(domain);
  if (!data) {
    return { ok: false, error: 'Site not found', status: 404 };
  }

  if (updates.accent !== undefined && !storage.VALID_ACCENT.test(updates.accent)) {
    return { ok: false, error: 'Invalid accent color', status: 400 };
  }
  data.accent = updates.accent;

  await storage.writeSiteMetadata(domain, data);
  return { ok: true, value: undefined };
}

export async function getSiteRepos(domain: string): Promise<{ history: Array<{ repo: string; branch: string; lastUsed: number }> } | null> {
  const data = await storage.readSiteMetadata(domain);
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

export async function getCustomDomains(domain: string): Promise<{ domain: string; verified: boolean }[]> {
  const data = await storage.readSiteMetadata(domain);
  if (!data) return [];
  return data.customDomains ?? [];
}

export async function getAllCustomDomains(): Promise<{ siteDomain: string; customDomain: string; verified: boolean }[]> {
  const domains = await storage.listDomains();
  const allCustomDomains: { siteDomain: string; customDomain: string; verified: boolean }[] = [];

  for (const domain of domains) {
    const data = await storage.readSiteMetadata(domain);
    if (data?.customDomains) {
      for (const entry of data.customDomains) {
        allCustomDomains.push({
          siteDomain: domain,
          customDomain: entry.domain,
          verified: entry.verified,
        });
      }
    }
  }

  return allCustomDomains;
}

export async function addCustomDomain(domain: string, customDomain: string): Promise<UsecaseResult<void>> {
  const data = await storage.readSiteMetadata(domain);
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
  await storage.writeSiteMetadata(domain, data);
  invalidateCustomDomainCache();
  return { ok: true, value: undefined };
}

export async function removeCustomDomain(domain: string, customDomain: string): Promise<UsecaseResult<void>> {
  const data = await storage.readSiteMetadata(domain);
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
  await storage.writeSiteMetadata(domain, data);
  invalidateCustomDomainCache();
  return { ok: true, value: undefined };
}

export async function verifyCustomDomain(domain: string, customDomain: string): Promise<UsecaseResult<{ verified: boolean }>> {
  const { verifyCustomDomain: dnsVerifyCustomDomain } = await import('./customDomains.ts');
  const data = await storage.readSiteMetadata(domain);
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
  
  await storage.writeSiteMetadata(domain, data);
  invalidateCustomDomainCache();
  
  const verified = isVerified;
  return { ok: true, value: { verified } };
}

export async function getVerificationToken(domain: string): Promise<{ token: string }> {
  const { getVerificationToken: dnsGetToken } = await import('./customDomains.ts');
  const token = await dnsGetToken(domain);
  return { token };
}

export async function toggleSite(domain: string): Promise<UsecaseResult<{ enabled: boolean }>> {
  const data = await storage.readSiteMetadata(domain);
  if (!data || data.currentIndex === null) {
    return { ok: false, error: 'Site not found', status: 404 };
  }

  data.enabled = !data.enabled;
  await storage.writeSiteMetadata(domain, data);

  if (!data.enabled) await storage.deleteExtractedFiles(domain);

  const result = { enabled: data.enabled };
  return { ok: true, value: result };
}

export async function deleteSite(domain: string): Promise<void> {
  await storage.deleteSiteFiles(domain);
  analytics.clearDomain(domain);
}

export async function listVersions(domain: string): Promise<{ versions: Array<{ index: number; size: number; source: { type: 'upload' } | { type: 'github'; repo: string; branch: string }; createdAt: number }>; current: number | null }> {
  const data = await storage.readSiteMetadata(domain);
  if (!data) return { versions: [], current: null };

  const versions = [];

  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    try {
      const stat = await Deno.stat(storage.versionPath(domain, index));
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

export async function downloadVersion(domain: string, index: number): Promise<{ file: Deno.FsFile; filename: string } | null> {
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  if (!(await storage.versionExists(domain, index))) return null;
  const file = await storage.openVersion(domain, index);
  return { file, filename: `${domain}-${index}.zip` };
}

export async function activateVersion(domain: string, index: number): Promise<UsecaseResult<void>> {
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await storage.versionExists(domain, index);
  if (!exists) {
    return { ok: false, error: 'Version not found', status: 404 };
  }
  const activated = await storage.setCurrentVersion(domain, index);
  if (!activated) {
    return { ok: false, error: 'Failed to activate version', status: 500 };
  }
  await storage.deleteExtractedFiles(domain);
  return { ok: true, value: undefined };
}

export async function deleteVersion(domain: string, index: number): Promise<UsecaseResult<void>> {
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await storage.versionExists(domain, index);
  if (!exists) {
    return { ok: false, error: 'Version not found', status: 404 };
  }
  const deleted = await storage.deleteVersionFile(domain, index);
  if (!deleted) {
    return { ok: false, error: 'Failed to delete version', status: 500 };
  }
  return { ok: true, value: undefined };
}

export async function uploadVersion(domain: string, zipData: Uint8Array): Promise<{ index: number }> {
  const existingData = await storage.readSiteMetadata(domain);
  const data = existingData ?? { ...storage.DEFAULT_DATA };
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  if (data.currentIndex === null) data.currentIndex = index;

  await Deno.mkdir(storage.domainDir(domain), { recursive: true });
  await Deno.mkdir(storage.versionsDir(domain), { recursive: true });
  await Deno.writeFile(storage.versionPath(domain, index), zipData);
  await storage.writeSiteMetadata(domain, data);

  return { index };
}

export async function deployFromGithub(domain: string, repo: string, ref: string): Promise<{ index: number; repo: string; branch: string }> {
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

  const existingData = await storage.readSiteMetadata(domain);
  const data = existingData ?? { ...storage.DEFAULT_DATA };
  const filtered = data.repoHistory.filter((h) => {
    return !(h.repo === repo && h.branch === ref);
  });
  filtered.unshift({ repo, branch: ref, lastUsed: Date.now() });
  data.repoHistory = filtered.slice(0, 10);
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'github', repo, branch: ref }, createdAt: Date.now() };
  if (data.currentIndex === null) data.currentIndex = index;

  await Deno.mkdir(storage.domainDir(domain), { recursive: true });
  await Deno.mkdir(storage.versionsDir(domain), { recursive: true });
  await Deno.writeFile(storage.versionPath(domain, index), zipData);
  await storage.writeSiteMetadata(domain, data);

  return { index, repo, branch: ref };
}

export function recordPageHit(domain: string, ip: string): void {
  analytics.recordHit(domain, ip);
}

export async function serveSiteFile(domain: string, filePath: string): Promise<{ file: Deno.FsFile; contentType: string } | null> {
  const data = await storage.readSiteMetadata(domain);
  if (!data) return null;

  if (!(await storage.extractedSiteExists(domain))) {
    if (!data.enabled || data.currentIndex === null) return null;

    try {
      const { readZip } = await import('../../shared/zip.ts');
      const zipData = await storage.readActiveVersion(domain);
      if (!zipData) return null;
      const files = await readZip(zipData);
      await storage.extractFiles(domain, files);
    } catch {
      return null;
    }
  }

  const file = await storage.readExtractedFile(domain, filePath);
  if (!file) return null;

  const parts = filePath.split('.');
  const ext = parts.pop() ?? '';
  return { file, contentType: getContentType(ext) };
}

export async function resolveDomainAndServe(host: string, path: string): Promise<{ domain: string; filePath: string } | null> {
  console.assert(typeof host === 'string' && host.length > 0, 'host must be a non-empty string');
  console.assert(typeof path === 'string', 'path must be a string');
  
  // Check custom domain registry first
  const cache = await getCustomDomainCache();
  const mappedDomain = cache.get(host);
  if (mappedDomain) {
    const filePath = path === '/' ? '/index.html' : path;
    return { domain: mappedDomain, filePath };
  }
  
  const subdomainMatch = host.match(/^([^.]+)\./);

  if (subdomainMatch && subdomainMatch[1] && !['www', 'localhost'].includes(subdomainMatch[1])) {
    const domain = subdomainMatch[1];
    const filePath = path === '/' ? '/index.html' : path;
    return { domain, filePath };
  }

  if (path.length > 1) {
    const parts = path.split('/').filter(Boolean);
    const potential = parts[0];
    if (potential && VALID_DOMAIN.test(potential)) {
      const info = await storage.readSiteMetadata(potential);
      if (info && info.currentIndex !== null) {
        const domain = potential;
        const rest = parts.slice(1).join('/');
        const filePath = rest !== '' ? '/' + rest : '/index.html';
        return { domain, filePath };
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
