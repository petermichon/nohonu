import { site as siteTable } from '../../db/site.ts';
import { SITE_INFO_SELECT, toSiteInfo } from '../../shared/site-info.ts';

export async function getSiteInfo(user: string, siteId: string): Promise<Awaited<ReturnType<typeof toSiteInfo>>> {
  const site = await siteTable.findUnique({
    where: { userUsername_siteId: { userUsername: user, siteId } },
    select: SITE_INFO_SELECT,
  });
  return toSiteInfo(site);
}
