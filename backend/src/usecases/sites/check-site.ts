import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';


export async function checkSite(user: string, domain: string): Promise<{ exists: boolean; enabled: boolean }> {
  const data = await readSiteMetadata(user, domain);
  return {
    exists: !!data && data.currentIndex !== null,
    enabled: data?.enabled ?? false,
  };
}


