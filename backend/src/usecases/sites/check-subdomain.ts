import { user as userTable } from '../../db/user.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { VALID_DOMAIN } from '../../shared/node/paths.ts';
import { site } from '../../db/site.ts';

export async function checkSubdomain(subdomain: string): Promise<boolean> {
  if (!subdomain || !VALID_DOMAIN.test(subdomain)) return false;
  const users = (await userTable.findMany({ select: { username: true } })).map((u) => u.username);
  for (const user of users) {
    const domains = (await site.findMany({ where: { userUsername: user }, select: { domain: true } })).map((s) => s.domain);
    for (const domain of domains) {
      const data = await readSiteMetadata(user, domain);
      if (data?.subdomain === subdomain) return true;
    }
  }
  return false;
}


