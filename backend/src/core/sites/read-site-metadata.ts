import { db } from '../../db.ts';
import type { SiteData } from '../../shared/paths.ts';
import { toSiteData } from '../../shared/site-data.ts';
import { siteWhere } from '../../shared/site-where.ts';

export async function readSiteMetadata(user: string, domain: string): Promise<SiteData | undefined> {
  const record = await db.site.findUnique({
    where: siteWhere(user, domain),
    include: { versions: true, repoHistories: true, customDomains: true, starredBy: true },
  });
  if (!record) return undefined;
  return toSiteData(record);
}
