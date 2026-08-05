import { db } from '../../db.ts';
import * as analytics from '../analytics/metrics.ts';
import { readSiteMetadata } from './read-site-metadata.ts';
import type { SiteSummary } from '../../shared/site-summary.ts';

export async function listSites(user: string): Promise<SiteSummary[]> {
  const [domains, userRecord] = await Promise.all([
    db.site.findMany({ where: { userUsername: user }, select: { domain: true } }).then((sites) => sites.map((s) => s.domain)),
    db.user.findUnique({ where: { username: user }, select: { profilePicture: true } }),
  ]);
  const accountProfilePicture = userRecord?.profilePicture ?? undefined;
  return Promise.all(
    domains.map(async (domain) => {
      const data = await readSiteMetadata(user, domain);
      return {
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
        isStarred: data?.starredBy?.includes(user),
      };
    }),
  );
}
