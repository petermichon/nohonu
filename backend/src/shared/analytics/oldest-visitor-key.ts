export function oldestVisitorKey(visitors: Map<string, { count: number; last: number }>): string {
  let oldestKey = '';
  let oldestTime = Infinity;
  for (const [entryIp, entryData] of visitors.entries()) {
    if (entryData.last < oldestTime) {
      oldestTime = entryData.last;
      oldestKey = entryIp;
    }
  }
  return oldestKey;
}
