import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';

export async function checkSite(user: string, siteId: string): Promise<{ exists: boolean; enabled: boolean }> {
  const data = await readSiteMetadata(user, siteId);
  return {
    exists: !!data && data.currentIndex !== null,
    enabled: data?.enabled ?? false,
  };
}


