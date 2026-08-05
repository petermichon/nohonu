import { db } from '../../db.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import * as analytics from '../../core/analytics/metrics.ts';
import type { PublicSiteSummary } from '../../shared/public-site-summary.ts';


export async function listAllSites(username?: string): Promise<PublicSiteSummary[]> {
  const users = (await db.user.findMany({ select: { username: true } })).map((u) => u.username);
  const allSites: PublicSiteSummary[] = [];

  for (const user of users) {
    const [domains, userRecord] = await Promise.all([
      db.site.findMany({ where: { userUsername: user }, select: { domain: true } }).then((sites) => sites.map((s) => s.domain)),
      db.user.findUnique({ where: { username: user }, select: { profilePicture: true } }),
    ]);
    const accountProfilePicture = userRecord?.profilePicture ?? undefined;
    for (const domain of domains) {
      const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const data = record ? toSiteData(record) : undefined;
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


