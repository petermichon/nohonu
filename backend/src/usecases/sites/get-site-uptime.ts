import { SLOT_MS } from '../../config.ts';
import { uptime } from '../../memory.ts';
import { assertStatsParams } from '../../shared/assert-stats-params.ts';
import { buildUptimeSeries } from '../../shared/uptime-series.ts';


export function getSiteUptime(domain: string, slots: number, groupMinutes = 1): { slot: number; up: boolean | undefined }[] {
  assertStatsParams(domain, slots, groupMinutes);
  const now = Math.floor(Date.now() / SLOT_MS);
  return buildUptimeSeries(uptime.get(domain), now, slots, groupMinutes);
}
