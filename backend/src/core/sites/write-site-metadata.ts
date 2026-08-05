import type { SiteData } from '../../shared/paths.ts';
import { syncCustomDomains } from './sync-custom-domains.ts';
import { syncRepoHistory } from './sync-repo-history.ts';
import { syncStarredBy } from './sync-starred-by.ts';
import { syncVersions } from './sync-versions.ts';
import { upsertSite } from './upsert-site.ts';

export async function writeSiteMetadata(user: string, domain: string, data: SiteData): Promise<void> {
  if (data.nextIndex < 1) {
    console.error(`writeSiteMetadata: nextIndex must be >= 1 for ${user}/${domain}, got ${data.nextIndex}`);
    return;
  }

  const siteId = await upsertSite(user, domain, data);
  if (!siteId) return;

  await syncVersions(siteId, data.versions);
  await syncRepoHistory(siteId, data.repoHistory);
  await syncCustomDomains(siteId, data.customDomains ?? []);
  await syncStarredBy(siteId, data.starredBy ?? []);
}
