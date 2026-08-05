import { hits } from './analytics-state.ts';

export function getTotalHits(domain: string): number {
  const d = hits.get(domain);
  if (!d) {
    return 0;
  }
  let total = 0;
  for (const count of d.values()) {
    total += count;
  }
  return total;
}
