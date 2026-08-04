import { db } from '../../db.ts';
import { toSiteInfo } from '../../shared/site-info.ts';

const SELECT = {
  enabled: true,
  subdomain: true,
  siteId: true,
  displayName: true,
  account: true,
  coverImage: true,
  currentIndex: true,
} as const;


export async function getSiteInfo(user: string, domain: string): Promise<Awaited<ReturnType<typeof toSiteInfo>>> {
  const site = await db.site.findUnique({
    where: { userUsername_domain: { userUsername: user, domain } },
    select: SELECT,
  });
  return toSiteInfo(site);
}
