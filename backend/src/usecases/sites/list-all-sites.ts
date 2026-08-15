import { hits } from '../../memory/hits.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { uptime } from '../../memory/uptime.ts';
import { user as userTable } from '../../db/user.ts';
import { totalHits } from '../../shared/hits-total.ts';
import { siteKey } from '../../shared/site-key.ts';
import { uptimePercentage } from '../../shared/uptime-percentage.ts';
import { site } from '../../db/site.ts';

import type { PublicSiteSummary } from '../../shared/public-site-summary.ts';


export async function listAllSites(username?: string): Promise<PublicSiteSummary[]> {
  const users = (await userTable.findMany({ select: { username: true } })).map((u) => u.username);
  const allSites: PublicSiteSummary[] = [];

  for (const user of users) {
    const [domains, userRecord] = await Promise.all([
      site.findMany({ where: { userUsername: user }, select: { siteId: true } }).then((sites) => sites.map((s) => s.siteId)),
      userTable.findUnique({ where: { username: user }, select: { profilePicture: true } }),
    ]);
    const accountProfilePicture = userRecord?.profilePicture ?? undefined;
    for (const siteId of domains) {
      const data = await readSiteMetadata(user, siteId);
      allSites.push({
        user,
        siteId,
        enabled: data?.enabled ?? false,
        hits: totalHits(hits.get(siteKey(user, siteId))),
        uptime: uptimePercentage(uptime.get(siteKey(user, siteId))),
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


