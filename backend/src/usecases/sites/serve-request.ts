import { SLOT_MS } from '../../config.ts';
import { hits } from '../../memory/hits.ts';
import { visitors } from '../../memory/visitors.ts';
import { MAX_VISITORS_PER_DOMAIN } from '../../shared/max-visitors-per-domain.ts';
import { STATS_SLOTS } from '../../shared/stats-slots.ts';
import { resolveDomainAndServe } from './resolve-domain-and-serve.ts';
import { serveSiteFile } from './serve-site-file.ts';

export async function serveRequest(
  host: string,
  path: string,
  ip: string,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const resolved = await resolveDomainAndServe(host, path);
  if (!resolved) return null;

  const result = await serveSiteFile(resolved.user, resolved.domain, resolved.filePath);
  if (!result) return null;

  if (result.contentType === 'text/html') {
    const slot = Math.floor(Date.now() / SLOT_MS);
    const domainHits = hits.get(resolved.domain) ?? new Map();
    hits.set(resolved.domain, domainHits);
    const prevHits = domainHits.get(slot) ?? 0;
    domainHits.set(slot, prevHits + 1);
    const cutoff = slot - STATS_SLOTS;
    for (const k of domainHits.keys()) {
      if (k < cutoff) {
        domainHits.delete(k);
      }
    }

    const domainVisitors = visitors.get(resolved.domain) ?? new Map();
    visitors.set(resolved.domain, domainVisitors);
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
  return result;
}
