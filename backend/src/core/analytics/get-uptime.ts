import { SLOT_MS } from '../../config.ts';
import { buildUptimeSeries } from '../../shared/uptime-series.ts';
import { uptime } from './analytics-state.ts';

export function getUptime(domain: string, slots = 60, groupMinutes = 1): { slot: number; up: boolean | undefined }[] {
  const now = Math.floor(Date.now() / SLOT_MS);
  return buildUptimeSeries(uptime.get(domain), now, slots, groupMinutes);
}
