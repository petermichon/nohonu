import { user as userTable } from '../../db/user.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { VALID_SITE_ID } from '../../shared/paths.ts';
import { site } from '../../db/site.ts';

export async function checkSubdomain(subdomain: string): Promise<boolean> {
  if (!subdomain || !VALID_SITE_ID.test(subdomain)) return false;
  const users = (await userTable.findMany({ select: { username: true } })).map((u) => u.username);
  for (const user of users) {
    const domains = (await site.findMany({ where: { userUsername: user }, select: { siteId: true } })).map((s) => s.siteId);
    for (const siteId of domains) {
      const data = await readSiteMetadata(user, siteId);
      if (data?.subdomain === subdomain) return true;
    }
  }
  return false;
}


