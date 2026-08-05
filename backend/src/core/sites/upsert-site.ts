import { site } from '../../db/site.ts';
import type { SiteData } from '../../shared/paths.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';

export async function upsertSite(user: string, domain: string, data: SiteData): Promise<string | undefined> {
  const upserted = await site.upsert(toSiteUpsert(user, domain, data));
  return upserted?.id;
}
