import { analytics } from '../../db/analytics.ts';
import { site as siteTable } from '../../db/site.ts';
import { hits, uptime, visitors } from '../../memory.ts';
import { siteWhere } from '../../shared/site-where.ts';

import type { AnalyticsSnapshot } from '../../shared/analytics-snapshot.ts';


export async function saveAnalytics(user: string, domain: string): Promise<void> {
  const site = await siteTable.findUnique({ where: siteWhere(user, domain), select: { id: true } });
  if (!site) return;

  const snapshot: AnalyticsSnapshot = { hits: {}, visitors: {}, uptime: {} };
  const domainHits = hits.get(domain);
  if (domainHits) snapshot.hits = Object.fromEntries(domainHits);
  const domainVisitors = visitors.get(domain);
  if (domainVisitors) snapshot.visitors = Object.fromEntries(domainVisitors);
  const domainUptime = uptime.get(domain);
  if (domainUptime) snapshot.uptime = Object.fromEntries(domainUptime);
  try {
    await analytics.upsert({
      where: { siteId: site.id },
      create: { siteId: site.id, data: JSON.stringify(snapshot) },
      update: { data: JSON.stringify(snapshot) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to save analytics snapshot for ${user}/${domain}: ${message}`);
  }
}
