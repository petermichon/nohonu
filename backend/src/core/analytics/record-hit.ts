import { SLOT_MS } from '../../config.ts';
import { hits, visitors } from './analytics-state.ts';
import { MAX_VISITORS_PER_DOMAIN } from './max-visitors-per-domain.ts';
import { STATS_SLOTS } from './stats-slots.ts';

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
