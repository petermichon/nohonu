import { db } from '../../db.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

export async function checkSubdomain(subdomain: string): Promise<boolean> {
  if (!subdomain || !VALID_DOMAIN.test(subdomain)) return false;
  const users = (await db.user.findMany({ select: { username: true } })).map((u) => u.username);
  for (const user of users) {
    const domains = (await db.site.findMany({ where: { userUsername: user }, select: { domain: true } })).map((s) => s.domain);
    for (const domain of domains) {
      const record = await db.site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const data = record ? toSiteData(record) : undefined;
      if (data?.subdomain === subdomain) return true;
    }
  }
  return false;
}


