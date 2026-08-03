import { readSiteInfo } from '../../core/sites/get-site-info.ts';


export async function getSiteInfo(user: string, domain: string): Promise<Awaited<ReturnType<typeof readSiteInfo>>> {
  return await readSiteInfo(user, domain);
}
