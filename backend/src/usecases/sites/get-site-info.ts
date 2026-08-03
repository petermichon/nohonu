import * as sitesDb from '../../core/sites/db.ts';


export async function getSiteInfo(
  user: string,
  domain: string,
): Promise<{
  enabled: boolean;
  subdomain?: string;
  siteId: string;
  displayName?: string;
  account?: string;
  coverImage?: string;
} | null> {
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


