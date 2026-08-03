import * as sitesDb from '../../core/sites/db.ts';


export async function checkSite(user: string, domain: string): Promise<{ exists: boolean; enabled: boolean }> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  return {
    exists: !!data && data.currentIndex !== null,
    enabled: data?.enabled ?? false,
  };
}


