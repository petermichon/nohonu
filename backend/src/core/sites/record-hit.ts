import { SLOT_MS } from '../../config.ts';
import { hits } from '../../memory/hits.ts';
import { visitors } from '../../memory/visitors.ts';
import { MAX_VISITORS_PER_DOMAIN } from '../../shared/analytics/max-visitors-per-domain.ts';
import { oldestVisitorKey } from '../../shared/analytics/oldest-visitor-key.ts';
import { STATS_SLOTS } from '../../shared/analytics/stats-slots.ts';

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
    const oldestIp = oldestVisitorKey(domainVisitors);
    if (oldestIp) {
      domainVisitors.delete(oldestIp);
    }
  }
}
