export interface SiteInfo {
  enabled: boolean;
  subdomain?: string;
  siteId: string;
  displayName?: string;
  account?: string;
  coverImage?: string;
}

export function toSiteInfo(
  site: {
    enabled: boolean;
    subdomain: string | null;
    siteId: string;
    displayName: string | null;
    account: string | null;
    coverImage: string | null;
    currentIndex: number | null;
  } | null,
): SiteInfo | null {
  if (!site || site.currentIndex === null) return null;
  return {
    enabled: site.enabled,
    subdomain: site.subdomain ?? undefined,
    siteId: site.siteId,
    displayName: site.displayName ?? undefined,
    account: site.account ?? undefined,
    coverImage: site.coverImage ?? undefined,
  };
}
