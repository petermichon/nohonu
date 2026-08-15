import { uptime } from '../../memory/uptime.ts';
import { SLOT_MS } from '../../config.ts';
import { siteKey } from '../../shared/site-key.ts';
import { UPTIME_SLOTS } from '../../shared/uptime-slots.ts';


export function recordUptime(user: string, siteId: string, up: boolean): void {
  const key = siteKey(user, siteId);
  const slot = Math.floor(Date.now() / SLOT_MS);
  const d = uptime.get(key) ?? new Map();
  uptime.set(key, d);
  d.set(slot, up);
  const cutoff = slot - UPTIME_SLOTS;
  for (const k of d.keys()) {
    if (k < cutoff) {
      d.delete(k);
    }
  }
}
