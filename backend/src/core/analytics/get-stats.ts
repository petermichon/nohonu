import { SLOT_MS } from '../../config.ts';
import { hits } from './analytics-state.ts';
import { STATS_SLOTS } from '../../shared/stats-slots.ts';

function buildStatSlot(
  domainData: Map<number, number>,
  now: number,
  count: number,
  i: number,
): { slot: number; count: number } {
  const slot = now - (count - 1 - i);
  return { slot, count: domainData.get(slot) ?? 0 };
}

export function getStats(domain: string, slots = STATS_SLOTS, groupMinutes = 1): { slot: number; count: number }[] {
  const now = Math.floor(Date.now() / SLOT_MS);
  const d = hits.get(domain) ?? new Map<number, number>();
  const count = slots;
  const groupSize = groupMinutes;

  if (groupSize === 1) {
    // No grouping, return as-is
    const result = Array.from({ length: count }, (_, i) => {
      return buildStatSlot(d, now, count, i);
    });
    return result;
  }

  // Group data - ensure all group slots are represented
  const grouped: Map<number, number> = new Map();
  const groupSlots = new Set<number>();

  for (let i = 0; i < count; i++) {
    const slot = now - (count - 1 - i);
    const groupSlot = Math.floor(slot / groupSize) * groupSize;
    groupSlots.add(groupSlot);
    const slotCount = d.get(slot) ?? 0;
    const existing = grouped.get(groupSlot) ?? 0;
    grouped.set(groupSlot, existing + slotCount);
  }

  // Convert to array, ensuring all group slots are present
  const sortedGroupSlots = Array.from(groupSlots).sort((a, b) => a - b);
  const result = sortedGroupSlots.map((slot) => ({
    slot,
    count: grouped.get(slot) ?? 0,
  }));
  return result;
}
