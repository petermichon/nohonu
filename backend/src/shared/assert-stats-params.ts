export function assertStatsParams(siteId: string, slots: number, groupMinutes: number): void {
  console.assert(typeof siteId === 'string' && siteId.length > 0, 'siteId must be a non-empty string');
  console.assert(typeof slots === 'number' && !isNaN(slots) && slots > 0, 'slots must be a positive number');
  console.assert(
    typeof groupMinutes === 'number' && !isNaN(groupMinutes) && groupMinutes > 0,
    'groupMinutes must be a positive number',
  );
}
