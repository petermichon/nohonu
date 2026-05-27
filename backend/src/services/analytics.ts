export const SLOT_MS = 60 * 1000;
export const STATS_SLOTS = 60;
export const UPTIME_SLOTS = 1440;

export const hits = new Map<string, Map<number, number>>();
export const visitors = new Map<string, Map<string, { count: number; last: number }>>();
export const uptime = new Map<string, Map<number, boolean>>();

export function recordHit(domain: string, ip: string): void {
  const slot = Math.floor(Date.now() / SLOT_MS);
  const domainHits = hits.get(domain) ?? new Map();
  hits.set(domain, domainHits);
  const prevHits = domainHits.get(slot) ?? 0;
  domainHits.set(slot, prevHits + 1);
  const cutoff = slot - STATS_SLOTS;
  for (const k of domainHits.keys()) {
    if (k < cutoff) {
      domainHits.delete(k);
    }
  }

  const domainVisitors = visitors.get(domain) ?? new Map();
  visitors.set(domain, domainVisitors);
  const existing = domainVisitors.get(ip);
  const prevCount = existing?.count ?? 0;
  domainVisitors.set(ip, {
    count: prevCount + 1,
    last: Date.now(),
  });
}

export function getVisitors(domain: string): { ip: string; count: number; last: number }[] {
  const domainVisitors = visitors.get(domain);
  if (!domainVisitors) {
    return [];
  }
  const entries = Array.from(domainVisitors.entries());
  const mapped = entries.map(([ip, data]) => {
    return { ip, ...data };
  });
  const sorted = mapped.sort((a, b) => {
    return b.count - a.count;
  });
  return sorted;
}

function buildStatSlot(
  domainData: Map<number, number>,
  now: number,
  count: number,
  i: number,
): { slot: number; count: number } {
  const slot = now - (count - 1 - i);
  return { slot, count: domainData.get(slot) ?? 0 };
}

export function getStats(domain: string, slots = STATS_SLOTS): { slot: number; count: number }[] {
  const now = Math.floor(Date.now() / SLOT_MS);
  const d = hits.get(domain) ?? new Map<number, number>();
  const count = Math.min(slots, STATS_SLOTS);
  const result = Array.from({ length: count }, (_, i) => {
    return buildStatSlot(d, now, count, i);
  });
  return result;
}

export function recordUptime(domain: string, up: boolean): void {
  const slot = Math.floor(Date.now() / SLOT_MS);
  const d = uptime.get(domain) ?? new Map();
  uptime.set(domain, d);
  d.set(slot, up);
  const cutoff = slot - UPTIME_SLOTS;
  for (const k of d.keys()) {
    if (k < cutoff) {
      d.delete(k);
    }
  }
}

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

export function getUptime(domain: string, slots = 60): { slot: number; up: boolean | undefined }[] {
  const now = Math.floor(Date.now() / SLOT_MS);
  const d = uptime.get(domain);
  const count = Math.min(slots, UPTIME_SLOTS);
  const result = Array.from({ length: count }, (_, i) => {
    return buildUptimeSlot(d, now, count, i);
  });
  return result;
}

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
