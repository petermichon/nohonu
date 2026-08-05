import { hits } from '../../memory/hits.ts';
import { SLOT_MS } from '../../config.ts';
import { assertStatsParams } from '../../shared/analytics/assert-stats-params.ts';
import { buildStatsSeries } from '../../shared/analytics/stats-series.ts';
import { STATS_SLOTS } from '../../shared/analytics/stats-slots.ts';


export function getSiteStats(domain: string, slots: number, groupMinutes = 1): { slot: number; count: number }[] {
  assertStatsParams(domain, slots, groupMinutes);
  const now = Math.floor(Date.now() / SLOT_MS);
  return buildStatsSeries(hits.get(domain) ?? new Map<number, number>(), now, slots, groupMinutes);
}
