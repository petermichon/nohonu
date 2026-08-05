import { site as siteTable } from '../../db/site.ts';
import { SITE_INFO_SELECT, toSiteInfo } from '../../shared/site-info.ts';

export async function getSiteInfo(user: string, domain: string): Promise<Awaited<ReturnType<typeof toSiteInfo>>> {
  const site = await siteTable.findUnique({
    where: { userUsername_domain: { userUsername: user, domain } },
    select: SITE_INFO_SELECT,
  });
  return toSiteInfo(site);
}
