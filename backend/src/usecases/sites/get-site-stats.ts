import { hits } from '../../memory/hits.ts';
import { SLOT_MS } from '../../config.ts';
import { assertStatsParams } from '../../shared/assert-stats-params.ts';
import { siteKey } from '../../shared/site-key.ts';
import { buildStatsSeries } from '../../shared/stats-series.ts';
import { STATS_SLOTS } from '../../shared/stats-slots.ts';


export function getSiteStats(user: string, siteId: string, slots: number, groupMinutes = 1): { slot: number; count: number }[] {
  assertStatsParams(siteId, slots, groupMinutes);
  const now = Math.floor(Date.now() / SLOT_MS);
  return buildStatsSeries(hits.get(siteKey(user, siteId)) ?? new Map<number, number>(), now, slots, groupMinutes);
}
