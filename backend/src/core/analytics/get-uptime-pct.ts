import { uptime } from './analytics-state.ts';

export function getUptimePct(domain: string): number | undefined {
  const d = uptime.get(domain);
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
