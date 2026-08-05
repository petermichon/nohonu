import { site } from '../../db/site.ts';
import { SITE_INCLUDE } from '../../shared/sites/site-include.ts';
import { siteWhere } from '../../shared/sites/site-where.ts';
import { toSiteData } from '../../shared/sites/to-site-data.ts';

export async function readSiteMetadata(user: string, domain: string) {
  const record = await site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  return record ? toSiteData(record) : undefined;
}
