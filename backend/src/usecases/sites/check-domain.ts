import { site } from '../../db/site.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

export async function checkDomain(user: string, rawDomain: string): Promise<boolean> {
  const domain = rawDomain.replace(/\.petermichon\.fr$/, '');
  if (!VALID_DOMAIN.test(domain)) return false;
  const record = await site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const data = record ? toSiteData(record) : undefined;
  return !!data && data.currentIndex !== null;
}


