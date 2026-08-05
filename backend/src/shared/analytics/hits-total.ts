export function totalHits(d: Map<number, number> | undefined): number {
  if (!d) return 0;
  let total = 0;
  for (const count of d.values()) {
    total += count;
  }
  return total;
}
