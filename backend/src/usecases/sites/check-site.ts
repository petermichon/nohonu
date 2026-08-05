import { db } from '../../db.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

export async function checkSite(user: string, domain: string): Promise<{ exists: boolean; enabled: boolean }> {
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const data = record ? toSiteData(record) : undefined;
  return {
    exists: !!data && data.currentIndex !== null,
    enabled: data?.enabled ?? false,
  };
}


