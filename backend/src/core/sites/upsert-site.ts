import { db } from '../../db.ts';
import type { SiteData } from '../../shared/paths.ts';
import { toSiteCreate, toSiteUpdate } from '../../shared/site-upsert-data.ts';
import { siteWhere } from '../../shared/site-where.ts';

export async function upsertSite(user: string, domain: string, data: SiteData): Promise<string | undefined> {
  const site = await db.site.upsert({
    where: siteWhere(user, domain),
    create: toSiteCreate(user, domain, data),
    update: toSiteUpdate(user, domain, data),
    select: { id: true },
  });
  return site?.id;
}
