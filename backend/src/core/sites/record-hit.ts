import { SLOT_MS } from '../../config.ts';
import { hits } from '../../memory/hits.ts';
import { visitors } from '../../memory/visitors.ts';
import { MAX_VISITORS_PER_SITE } from '../../shared/max-visitors-per-domain.ts';
import { oldestVisitorKey } from '../../shared/oldest-visitor-key.ts';
import { siteKey } from '../../shared/site-key.ts';
import { STATS_SLOTS } from '../../shared/stats-slots.ts';

export function recordHit(user: string, siteId: string, ip: string): void {
  const key = siteKey(user, siteId);
  const slot = Math.floor(Date.now() / SLOT_MS);
  const siteHits = hits.get(key) ?? new Map();
  hits.set(key, siteHits);
  const prevHits = siteHits.get(slot) ?? 0;
  siteHits.set(slot, prevHits + 1);
  const cutoff = slot - STATS_SLOTS;
  for (const k of siteHits.keys()) {
    if (k < cutoff) {
      siteHits.delete(k);
    }
  }

  const siteVisitors = visitors.get(key) ?? new Map();
  visitors.set(key, siteVisitors);
  const existing = siteVisitors.get(ip);
  const prevCount = existing?.count ?? 0;
  siteVisitors.set(ip, {
    count: prevCount + 1,
    last: Date.now(),
  });
  if (siteVisitors.size > MAX_VISITORS_PER_SITE) {
    const oldestIp = oldestVisitorKey(siteVisitors);
    if (oldestIp) {
      siteVisitors.delete(oldestIp);
    }
  }
}
