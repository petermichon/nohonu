import type { SiteData } from './node/paths.ts';
import type { SiteSummary } from './site-summary.ts';

export function toSiteSummary(
  domain: string,
  data: SiteData | undefined,
  user: string,
  accountProfilePicture: string | undefined,
  hits: number,
  uptime: number | undefined,
): SiteSummary {
  return {
    siteId: data?.siteId || domain,
    domain,
    enabled: data?.enabled ?? false,
    hits,
    uptime,
    account: data?.account,
    accountProfilePicture,
    displayName: data?.displayName,
    subdomain: data?.subdomain,
    coverImage: data?.coverImage,
    lastDeployedAt: data?.lastDeployedAt,
    starCount: data?.starCount,
    isStarred: data?.starredBy?.includes(user),
  };
}
