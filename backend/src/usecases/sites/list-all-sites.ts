import { db } from '../../db.ts';
import * as sitesDb from '../../core/sites/db.ts';
import * as analytics from '../../core/analytics/metrics.ts';
import type {PublicSiteSummary} from './types.ts';


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


