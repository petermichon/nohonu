import { SLOT_MS } from '../../config.ts';
import { uptime } from '../../memory.ts';
import { buildUptimeSeries } from '../../shared/uptime-series.ts';


export function getSiteUptime(domain: string, slots: number, groupMinutes = 1): { slot: number; up: boolean | undefined }[] {
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof slots === 'number' && !isNaN(slots) && slots > 0, 'slots must be a positive number');
  console.assert(
    typeof groupMinutes === 'number' && !isNaN(groupMinutes) && groupMinutes > 0,
    'groupMinutes must be a positive number',
  );
  const now = Math.floor(Date.now() / SLOT_MS);
  return buildUptimeSeries(uptime.get(domain), now, slots, groupMinutes);
}
