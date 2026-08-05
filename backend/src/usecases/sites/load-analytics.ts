import { hits } from '../../memory/hits.ts';
import { visitors } from '../../memory/visitors.ts';
import { uptime } from '../../memory/uptime.ts';
import { SLOT_MS } from '../../config.ts';
import { analytics } from '../../db/analytics.ts';
import { site as siteTable } from '../../db/site.ts';
import { siteWhere } from '../../shared/sites/site-where.ts';
import { STATS_SLOTS } from '../../shared/analytics/stats-slots.ts';
import { UPTIME_SLOTS } from '../../shared/analytics/uptime-slots.ts';

import type { AnalyticsSnapshot } from '../../shared/analytics/analytics-snapshot.ts';


export async function loadAnalytics(user: string, domain: string): Promise<void> {
  const site = await siteTable.findUnique({ where: siteWhere(user, domain), select: { id: true } });
  if (!site) return;

  const record = await analytics.findUnique({ where: { siteId: site.id } });
  if (!record) return;

  try {
    const snapshot = JSON.parse(record.data) as AnalyticsSnapshot;
    const now = Math.floor(Date.now() / SLOT_MS);

    const hitsMap = new Map<number, number>();
    for (const [slot, count] of Object.entries(snapshot.hits ?? {})) {
      const s = Number(slot);
      if (s >= now - STATS_SLOTS) hitsMap.set(s, count);
    }
    if (hitsMap.size > 0) hits.set(domain, hitsMap);

    const visitorsMap = new Map<string, { count: number; last: number }>(Object.entries(snapshot.visitors ?? {}));
    if (visitorsMap.size > 0) visitors.set(domain, visitorsMap);

    const uptimeMap = new Map<number, boolean>();
    for (const [slot, up] of Object.entries(snapshot.uptime ?? {})) {
      const s = Number(slot);
      if (s >= now - UPTIME_SLOTS) uptimeMap.set(s, up);
    }
    if (uptimeMap.size > 0) uptime.set(domain, uptimeMap);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to parse analytics snapshot for ${user}/${domain}: ${message}`);
  }
}
