import { db } from '../../db.ts';
import { findSiteId } from './find-site-id.ts';
import { hits, uptime, visitors } from './analytics-state.ts';
import type { AnalyticsSnapshot } from '../../shared/analytics-snapshot.ts';

export async function saveAnalytics(user: string, domain: string): Promise<void> {
  const siteId = await findSiteId(user, domain);
  if (!siteId) return;

  const snapshot: AnalyticsSnapshot = { hits: {}, visitors: {}, uptime: {} };
  const domainHits = hits.get(domain);
  if (domainHits) snapshot.hits = Object.fromEntries(domainHits);
  const domainVisitors = visitors.get(domain);
  if (domainVisitors) snapshot.visitors = Object.fromEntries(domainVisitors);
  const domainUptime = uptime.get(domain);
  if (domainUptime) snapshot.uptime = Object.fromEntries(domainUptime);
  try {
    await db.analytics.upsert({
      where: { siteId },
      create: { siteId, data: JSON.stringify(snapshot) },
      update: { data: JSON.stringify(snapshot) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to save analytics snapshot for ${user}/${domain}: ${message}`);
  }
}
