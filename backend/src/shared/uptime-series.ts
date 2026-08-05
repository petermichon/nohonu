function buildUptimeSlot(
  domainData: Map<number, boolean> | undefined,
  now: number,
  count: number,
  i: number,
): { slot: number; up: boolean | undefined } {
  const slot = now - (count - 1 - i);
  let up: boolean | undefined;
  if (domainData?.has(slot)) {
    up = domainData.get(slot) ?? false;
  } else {
    up = undefined;
  }
  return { slot, up };
}

export function buildUptimeSeries(
  data: Map<number, boolean> | undefined,
  now: number,
  slots: number,
  groupMinutes: number,
): { slot: number; up: boolean | undefined }[] {
  const count = slots;
  const groupSize = groupMinutes;

  if (groupSize === 1) {
    // No grouping, return as-is
    const result = Array.from({ length: count }, (_, i) => {
      return buildUptimeSlot(data, now, count, i);
    });
    return result;
  }

  // Group data - for uptime, we use "up if any slot in group is up"
  const grouped: Map<number, boolean | undefined> = new Map();
  const groupSlots = new Set<number>();

  for (let i = 0; i < count; i++) {
    const slot = now - (count - 1 - i);
    const groupSlot = Math.floor(slot / groupSize) * groupSize;
    groupSlots.add(groupSlot);
    const slotUp = data?.has(slot) ? data.get(slot) : undefined;
    const existing = grouped.get(groupSlot);

    if (existing === undefined) {
      grouped.set(groupSlot, slotUp);
    } else if (slotUp === true) {
      // If any slot in group is up, the group is up
      grouped.set(groupSlot, true);
    }
    // If existing is false and slotUp is false/undefined, keep false
  }

  // Convert to array, ensuring all group slots are present
  const sortedGroupSlots = Array.from(groupSlots).sort((a, b) => a - b);
  const result = sortedGroupSlots.map((slot) => ({
    slot,
    up: grouped.get(slot),
  }));
  return result;
}
