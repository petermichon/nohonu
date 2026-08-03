import { db } from '../../db.ts';
import * as analytics from '../analytics/metrics.ts';
import * as sitesDb from './db.ts';

export interface SiteSummary {
  siteId: string;
  domain: string;
  enabled: boolean;
  hits: number;
  uptime: number | undefined;
  account?: string;
  accountProfilePicture?: string;
  displayName?: string;
  subdomain?: string;
  coverImage?: string;
  lastDeployedAt?: number;
  starCount?: number;
  isStarred?: boolean;
}

export async function listSites(user: string): Promise<SiteSummary[]> {
  const [domains, userRecord] = await Promise.all([
    sitesDb.listDomains(user),
    db.user.findUnique({ where: { username: user }, select: { profilePicture: true } }),
  ]);
  const accountProfilePicture = userRecord?.profilePicture ?? undefined;
  return Promise.all(
    domains.map(async (domain) => {
      const data = await sitesDb.readSiteMetadata(user, domain);
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
