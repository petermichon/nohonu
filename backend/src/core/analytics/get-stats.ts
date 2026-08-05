import { SLOT_MS } from '../../config.ts';
import { buildStatsSeries } from '../../shared/stats-series.ts';
import { STATS_SLOTS } from '../../shared/stats-slots.ts';
import { hits } from './analytics-state.ts';

export function getStats(domain: string, slots = STATS_SLOTS, groupMinutes = 1): { slot: number; count: number }[] {
  const now = Math.floor(Date.now() / SLOT_MS);
  return buildStatsSeries(hits.get(domain) ?? new Map<number, number>(), now, slots, groupMinutes);
}
