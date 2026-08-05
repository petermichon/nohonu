import { uptime } from '../../memory/uptime.ts';
import { SLOT_MS } from '../../config.ts';
import { UPTIME_SLOTS } from '../../shared/uptime-slots.ts';


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
