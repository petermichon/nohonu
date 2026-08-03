import * as sitesDb from '../../core/sites/db.ts';
import * as storage from '../../core/sites/storage.ts';
import * as fsOps from '../../core/sites/fs.ts';
import * as analytics from '../../core/analytics/metrics.ts';
import { readZip } from '../../shared/zip.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import { getCustomDomainCache } from './custom-domains.ts';

export function recordPageHit(domain: string, ip: string): void {
  analytics.recordHit(domain, ip);
}

export async function serveSiteFile(
  user: string,
  domain: string,
  filePath: string,
): Promise<{ data: Uint8Array; contentType: string } | null> {
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

export async function resolveDomainAndServe(
  host: string,
  path: string,
): Promise<{ user: string; domain: string; filePath: string } | null> {
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
