import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { db } from '../../db.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';


export async function checkSubdomain(subdomain: string): Promise<boolean> {
  if (!subdomain || !VALID_DOMAIN.test(subdomain)) return false;
  const users = (await db.user.findMany({ select: { username: true } })).map((u) => u.username);
  for (const user of users) {
    const domains = (await db.site.findMany({ where: { userUsername: user }, select: { domain: true } })).map((s) => s.domain);
    for (const domain of domains) {
      const data = await readSiteMetadata(user, domain);
      if (data?.subdomain === subdomain) return true;
    }
  }
  return false;
}


