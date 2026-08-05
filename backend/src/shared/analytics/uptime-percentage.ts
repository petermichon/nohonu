export function uptimePercentage(d: Map<number, boolean> | undefined): number | undefined {
  if (!d || d.size === 0) {
    return undefined;
  }
  let up = 0;
  for (const v of d.values()) {
    if (v) {
      up += 1;
    }
  }
  return Math.round((up / d.size) * 100);
}
