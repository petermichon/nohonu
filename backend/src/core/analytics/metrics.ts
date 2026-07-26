import * as fs from 'node:fs/promises';
import { domainDir } from '../../shared/paths.ts';

export const SLOT_MS = 60 * 1000;
export const STATS_SLOTS = 86400;
export const UPTIME_SLOTS = 86400;
export const MAX_VISITORS_PER_DOMAIN = 500;

function analyticsPath(user: string, domain: string): string {
  return `${domainDir(user, domain)}/analytics.json`;
}

export const hits = new Map<string, Map<number, number>>();
export const visitors = new Map<string, Map<string, { count: number; last: number }>>();
export const uptime = new Map<string, Map<number, boolean>>();

type AnalyticsSnapshot = {
  hits: Record<number, number>;
  visitors: Record<string, { count: number; last: number }>;
  uptime: Record<number, boolean>;
};

export async function loadAnalytics(user: string, domain: string): Promise<void> {
  let content: string;
  try {
    content = await fs.readFile(analyticsPath(user, domain), 'utf-8');
  } catch {
    return;
  }
  try {
    const snapshot = JSON.parse(content) as AnalyticsSnapshot;
    const now = Math.floor(Date.now() / SLOT_MS);

    const hitsMap = new Map<number, number>();
    for (const [slot, count] of Object.entries(snapshot.hits ?? {})) {
      const s = Number(slot);
      if (s >= now - STATS_SLOTS) hitsMap.set(s, count);
    }
    if (hitsMap.size > 0) hits.set(domain, hitsMap);

    const visitorsMap = new Map<string, { count: number; last: number }>(Object.entries(snapshot.visitors ?? {}));
    if (visitorsMap.size > 0) visitors.set(domain, visitorsMap);

    const uptimeMap = new Map<number, boolean>();
    for (const [slot, up] of Object.entries(snapshot.uptime ?? {})) {
      const s = Number(slot);
      if (s >= now - UPTIME_SLOTS) uptimeMap.set(s, up);
    }
    if (uptimeMap.size > 0) uptime.set(domain, uptimeMap);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to parse analytics snapshot for ${user}/${domain}: ${message}`);
  }
}

export async function saveAnalytics(user: string, domain: string): Promise<void> {
  const snapshot: AnalyticsSnapshot = { hits: {}, visitors: {}, uptime: {} };
  const domainHits = hits.get(domain);
  if (domainHits) snapshot.hits = Object.fromEntries(domainHits);
  const domainVisitors = visitors.get(domain);
  if (domainVisitors) snapshot.visitors = Object.fromEntries(domainVisitors);
  const domainUptime = uptime.get(domain);
  if (domainUptime) snapshot.uptime = Object.fromEntries(domainUptime);
  try {
    await fs.writeFile(analyticsPath(user, domain), JSON.stringify(snapshot));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to save analytics snapshot for ${user}/${domain}: ${message}`);
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

export function getStats(domain: string, slots = STATS_SLOTS, groupMinutes = 1): { slot: number; count: number }[] {
  const now = Math.floor(Date.now() / SLOT_MS);
  const d = hits.get(domain) ?? new Map<number, number>();
  const count = slots;
  const groupSize = groupMinutes;

  if (groupSize === 1) {
    // No grouping, return as-is
    const result = Array.from({ length: count }, (_, i) => {
      return buildStatSlot(d, now, count, i);
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
    const slotCount = d.get(slot) ?? 0;
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

export function getUptime(domain: string, slots = 60, groupMinutes = 1): { slot: number; up: boolean | undefined }[] {
  const now = Math.floor(Date.now() / SLOT_MS);
  const d = uptime.get(domain);
  const count = slots;
  const groupSize = groupMinutes;

  if (groupSize === 1) {
    // No grouping, return as-is
    const result = Array.from({ length: count }, (_, i) => {
      return buildUptimeSlot(d, now, count, i);
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
    const slotUp = d?.has(slot) ? d.get(slot) : undefined;
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
