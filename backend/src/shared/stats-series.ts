function buildStatSlot(
  domainData: Map<number, number>,
  now: number,
  count: number,
  i: number,
): { slot: number; count: number } {
  const slot = now - (count - 1 - i);
  return { slot, count: domainData.get(slot) ?? 0 };
}

export function buildStatsSeries(
  data: Map<number, number>,
  now: number,
  slots: number,
  groupMinutes: number,
): { slot: number; count: number }[] {
  const count = slots;
  const groupSize = groupMinutes;

  if (groupSize === 1) {
    // No grouping, return as-is
    const result = Array.from({ length: count }, (_, i) => {
      return buildStatSlot(data, now, count, i);
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
    const slotCount = data.get(slot) ?? 0;
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
