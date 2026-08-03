import * as sitesDb from './db.ts';

export interface SiteInfo {
  enabled: boolean;
  subdomain?: string;
  siteId: string;
  displayName?: string;
  account?: string;
  coverImage?: string;
}

export async function readSiteInfo(user: string, domain: string): Promise<SiteInfo | null> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) return null;
  return {
    enabled: data.enabled,
    subdomain: data.subdomain,
    siteId: data.siteId,
    displayName: data.displayName,
    account: data.account,
    coverImage: data.coverImage,
  };
}
