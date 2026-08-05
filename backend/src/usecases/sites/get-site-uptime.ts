import { uptime } from '../../memory/uptime.ts';
import { SLOT_MS } from '../../config.ts';
import { assertStatsParams } from '../../shared/analytics/assert-stats-params.ts';
import { buildUptimeSeries } from '../../shared/analytics/uptime-series.ts';


export function getSiteUptime(domain: string, slots: number, groupMinutes = 1): { slot: number; up: boolean | undefined }[] {
  assertStatsParams(domain, slots, groupMinutes);
  const now = Math.floor(Date.now() / SLOT_MS);
  return buildUptimeSeries(uptime.get(domain), now, slots, groupMinutes);
}
