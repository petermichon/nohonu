import { SITES_DIR } from '../../shared/paths.ts';

export const SLOT_MS = 60 * 1000;
export const STATS_SLOTS = 60;
export const UPTIME_SLOTS = 1440;
export const MAX_VISITORS_PER_DOMAIN = 500;

const ANALYTICS_PATH = `${SITES_DIR}/analytics.json`;

export const hits = new Map<string, Map<number, number>>();
export const visitors = new Map<string, Map<string, { count: number; last: number }>>();
export const uptime = new Map<string, Map<number, boolean>>();

type AnalyticsSnapshot = {
  hits: Record<string, Record<number, number>>;
  visitors: Record<string, Record<string, { count: number; last: number }>>;
  uptime: Record<string, Record<number, boolean>>;
};

export async function loadAnalytics(): Promise<void> {
  let content: string;
  try {
    content = await Deno.readTextFile(ANALYTICS_PATH);
  } catch {
    return;
  }
  try {
    const snapshot = JSON.parse(content) as AnalyticsSnapshot;
    const now = Math.floor(Date.now() / SLOT_MS);
    for (const [domain, slots] of Object.entries(snapshot.hits ?? {})) {
      const m = new Map<number, number>();
      for (const [slot, count] of Object.entries(slots)) {
        const s = Number(slot);
        if (s >= now - STATS_SLOTS) m.set(s, count as number);
      }
      if (m.size > 0) hits.set(domain, m);
    }
    for (const [domain, ips] of Object.entries(snapshot.visitors ?? {})) {
      visitors.set(domain, new Map(Object.entries(ips as Record<string, { count: number; last: number }>)));
    }
    for (const [domain, slots] of Object.entries(snapshot.uptime ?? {})) {
      const m = new Map<number, boolean>();
      for (const [slot, up] of Object.entries(slots)) {
        const s = Number(slot);
        if (s >= now - UPTIME_SLOTS) m.set(s, up as boolean);
      }
      if (m.size > 0) uptime.set(domain, m);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to parse analytics snapshot: ${message}`);
  }
}

export async function saveAnalytics(): Promise<void> {
  const snapshot: AnalyticsSnapshot = { hits: {}, visitors: {}, uptime: {} };
  for (const [domain, m] of hits.entries()) {
    snapshot.hits[domain] = Object.fromEntries(m);
  }
  for (const [domain, m] of visitors.entries()) {
    snapshot.visitors[domain] = Object.fromEntries(m);
  }
  for (const [domain, m] of uptime.entries()) {
    snapshot.uptime[domain] = Object.fromEntries(m);
  }
  try {
    await Deno.writeTextFile(ANALYTICS_PATH, JSON.stringify(snapshot));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to save analytics snapshot: ${message}`);
  }
}

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
  if (domainVisitors.size > MAX_VISITORS_PER_DOMAIN) {
    let oldestIp = '';
    let oldestTime = Infinity;
    for (const [entryIp, entryData] of domainVisitors.entries()) {
      if (entryData.last < oldestTime) {
        oldestTime = entryData.last;
        oldestIp = entryIp;
      }
    }
    if (oldestIp) {
      domainVisitors.delete(oldestIp);
    }
  }
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

export function clearDomain(domain: string): void {
  hits.delete(domain);
  visitors.delete(domain);
  uptime.delete(domain);
}
