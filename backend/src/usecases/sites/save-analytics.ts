import { hits } from '../../memory/hits.ts';
import { visitors } from '../../memory/visitors.ts';
import { uptime } from '../../memory/uptime.ts';
import { analytics } from '../../db/analytics.ts';
import { site as siteTable } from '../../db/site.ts';
import { siteKey } from '../../shared/site-key.ts';
import { siteWhere } from '../../shared/site-where.ts';

import type { AnalyticsSnapshot } from '../../shared/analytics-snapshot.ts';


export async function saveAnalytics(user: string, siteId: string): Promise<void> {
  const site = await siteTable.findUnique({ where: siteWhere(user, siteId), select: { id: true } });
  if (!site) return;

  const snapshot: AnalyticsSnapshot = { hits: {}, visitors: {}, uptime: {} };
  const domainHits = hits.get(siteKey(user, siteId));
  if (domainHits) snapshot.hits = Object.fromEntries(domainHits);
  const domainVisitors = visitors.get(siteKey(user, siteId));
  if (domainVisitors) snapshot.visitors = Object.fromEntries(domainVisitors);
  const domainUptime = uptime.get(siteKey(user, siteId));
  if (domainUptime) snapshot.uptime = Object.fromEntries(domainUptime);
  try {
    await analytics.upsert({
      where: { siteId: site.id },
      create: { siteId: site.id, data: JSON.stringify(snapshot) },
      update: { data: JSON.stringify(snapshot) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to save analytics snapshot for ${user}/${siteId}: ${message}`);
  }
}
