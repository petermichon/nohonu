import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { listDomains } from '../../core/sites/list-domains.ts';
import { db } from '../../db.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import { getCustomDomainCache } from '../../core/sites/custom-domains-cache.ts';


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
    const site = await db.site.findFirst({ where: { domain: mappedDomain }, select: { userUsername: true } });
    const user = site?.userUsername ?? null;
    if (user) {
      const filePath = path === '/' ? '/index.html' : path;
      return { user, domain: mappedDomain, filePath };
    }
  }

  // Check for subdomain-based routing
  const subdomainMatch = host.match(/^([^.]+)\./);
  if (subdomainMatch && subdomainMatch[1] && !['www'].includes(subdomainMatch[1])) {
    const subdomain = subdomainMatch[1];
    // Find which site has this subdomain in its metadata
    const users = (await db.user.findMany({ select: { username: true } })).map((u) => u.username);
    for (const user of users) {
      const domains = await listDomains(user);
      for (const domain of domains) {
        const info = await readSiteMetadata(user, domain);
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
      const site = await db.site.findFirst({ where: { domain: potential }, select: { userUsername: true } });
      const user = site?.userUsername ?? null;
      if (user) {
        const info = await readSiteMetadata(user, potential);
        if (info && info.currentIndex !== null) {
          const domain = potential;
          const rest = parts.slice(1).join('/');
          const filePath = rest !== '' ? '/' + rest : '/index.html';
          return { user, domain, filePath };
        }
      }
    }
  }

  return null;
}
