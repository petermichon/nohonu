import { db } from '../../db.ts';
import { siteWhere } from '../../shared/site-where.ts';

export async function findSiteId(user: string, domain: string): Promise<string | undefined> {
  const site = await db.site.findUnique({
    where: siteWhere(user, domain),
    select: { id: true },
  });
  return site?.id;
}
