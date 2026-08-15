import { site } from '../../db/site.ts';
import type { SiteData } from '../../shared/paths.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';

export async function upsertSite(user: string, siteId: string, data: SiteData): Promise<string | undefined> {
  const upserted = await site.upsert(toSiteUpsert(user, siteId, data));
  return upserted?.id;
}
