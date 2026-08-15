import { customDomain } from '../../db/custom-domain.ts';
import { site } from '../../db/site.ts';
import { user } from '../../db/user.ts';
import { VALID_SITE_ID } from '../../shared/paths.ts';
import { requestFilePath } from '../../shared/request-file-path.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { splitSitePath } from '../../shared/split-site-path.ts';
import { subdomainOf } from '../../shared/subdomain-of.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

export async function resolveDomainAndServe(
  host: string,
  path: string,
): Promise<{ user: string; siteId: string; filePath: string } | null> {
  console.assert(typeof host === 'string' && host.length > 0, 'host must be a non-empty string');
  console.assert(typeof path === 'string', 'path must be a string');

  // Check custom domain registry first
  const customDomainRecord = await customDomain.findFirst({ where: { domain: host, verified: true }, select: { siteId: true } });
  const mappedSite = customDomainRecord
    ? await site.findUnique({ where: { id: customDomainRecord.siteId }, select: { siteId: true, userUsername: true } })
    : null;
  if (mappedSite && mappedSite.userUsername) {
    return { user: mappedSite.userUsername, siteId: mappedSite.siteId, filePath: requestFilePath(path) };
  }

  // Check for subdomain-based routing
  const subdomain = subdomainOf(host);
  if (subdomain) {
    // Find which site has this subdomain in its metadata
    const users = (await user.findMany({ select: { username: true } })).map((u) => u.username);
    for (const siteUser of users) {
      const siteIds = (await site.findMany({ where: { userUsername: siteUser }, select: { siteId: true } })).map((s) => s.siteId);
      for (const siteId of siteIds) {
        const record = await site.findUnique({ where: siteWhere(siteUser, siteId), include: SITE_INCLUDE });
        const info = record ? toSiteData(record) : undefined;
        if (info && info.subdomain === subdomain && info.currentIndex !== null) {
          return { user: siteUser, siteId, filePath: requestFilePath(path) };
        }
      }
    }
  }

  const { siteId: potential, filePath } = splitSitePath(path);
  if (potential && VALID_SITE_ID.test(potential)) {
    const siteRecord = await site.findFirst({ where: { siteId: potential }, select: { userUsername: true } });
    const siteUser = siteRecord?.userUsername ?? null;
    if (siteUser) {
      const record = await site.findUnique({ where: siteWhere(siteUser, potential), include: SITE_INCLUDE });
      const info = record ? toSiteData(record) : undefined;
      if (info && info.currentIndex !== null) {
        return { user: siteUser, siteId: potential, filePath };
      }
    }
  }

  return null;
}
