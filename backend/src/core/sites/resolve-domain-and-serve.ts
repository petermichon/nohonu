import { customDomain } from '../../db/custom-domain.ts';
import { site } from '../../db/site.ts';
import { user } from '../../db/user.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import { requestFilePath } from '../../shared/request-file-path.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { splitSitePath } from '../../shared/split-site-path.ts';
import { subdomainOf } from '../../shared/subdomain-of.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

export async function resolveDomainAndServe(
  host: string,
  path: string,
): Promise<{ user: string; domain: string; filePath: string } | null> {
  console.assert(typeof host === 'string' && host.length > 0, 'host must be a non-empty string');
  console.assert(typeof path === 'string', 'path must be a string');

  // Check custom domain registry first
  const customDomainRecord = await customDomain.findFirst({ where: { domain: host, verified: true }, select: { siteId: true } });
  const mappedSite = customDomainRecord ? await site.findUnique({ where: { id: customDomainRecord.siteId }, select: { domain: true } }) : null;
  const mappedDomain = mappedSite?.domain;
  if (mappedDomain) {
    const siteRecord = await site.findFirst({ where: { domain: mappedDomain }, select: { userUsername: true } });
    const siteUser = siteRecord?.userUsername ?? null;
    if (siteUser) {
      return { user: siteUser, domain: mappedDomain, filePath: requestFilePath(path) };
    }
  }

  // Check for subdomain-based routing
  const subdomain = subdomainOf(host);
  if (subdomain) {
    // Find which site has this subdomain in its metadata
    const users = (await user.findMany({ select: { username: true } })).map((u) => u.username);
    for (const siteUser of users) {
      const domains = (await site.findMany({ where: { userUsername: siteUser }, select: { domain: true } })).map((s) => s.domain);
      for (const domain of domains) {
        const record = await site.findUnique({ where: siteWhere(siteUser, domain), include: SITE_INCLUDE });
        const info = record ? toSiteData(record) : undefined;
        if (info && info.subdomain === subdomain && info.currentIndex !== null) {
          return { user: siteUser, domain, filePath: requestFilePath(path) };
        }
      }
    }
  }

  const { domain: potential, filePath } = splitSitePath(path);
  if (potential && VALID_DOMAIN.test(potential)) {
    const siteRecord = await site.findFirst({ where: { domain: potential }, select: { userUsername: true } });
    const siteUser = siteRecord?.userUsername ?? null;
    if (siteUser) {
      const record = await site.findUnique({ where: siteWhere(siteUser, potential), include: SITE_INCLUDE });
      const info = record ? toSiteData(record) : undefined;
      if (info && info.currentIndex !== null) {
        return { user: siteUser, domain: potential, filePath };
      }
    }
  }

  return null;
}
