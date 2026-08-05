import { customDomain } from '../../db/custom-domain.ts';
import { site as siteTable } from '../../db/site.ts';
import { user as userTable } from '../../db/user.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

export async function resolveDomainAndServe(
  host: string,
  path: string,
): Promise<{ user: string; domain: string; filePath: string } | null> {
  console.assert(typeof host === 'string' && host.length > 0, 'host must be a non-empty string');
  console.assert(typeof path === 'string', 'path must be a string');

  // Check custom domain registry first
  const customDomainRecord = await customDomain.findFirst({ where: { domain: host, verified: true }, select: { siteId: true } });
  const mappedSite = customDomainRecord ? await siteTable.findUnique({ where: { id: customDomainRecord.siteId }, select: { domain: true } }) : null;
  const mappedDomain = mappedSite?.domain;
  if (mappedDomain) {
    const site = await siteTable.findFirst({ where: { domain: mappedDomain }, select: { userUsername: true } });
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
    const users = (await userTable.findMany({ select: { username: true } })).map((u) => u.username);
    for (const user of users) {
      const domains = (await siteTable.findMany({ where: { userUsername: user }, select: { domain: true } })).map((s) => s.domain);
      for (const domain of domains) {
        const record = await siteTable.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const info = record ? toSiteData(record) : undefined;
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
      const site = await siteTable.findFirst({ where: { domain: potential }, select: { userUsername: true } });
      const user = site?.userUsername ?? null;
      if (user) {
        const record = await siteTable.findUnique({ where: siteWhere(user, potential), include: SITE_INCLUDE });
  const info = record ? toSiteData(record) : undefined;
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
