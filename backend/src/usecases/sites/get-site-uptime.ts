import { uptime } from '../../memory/uptime.ts';
import { SLOT_MS } from '../../config.ts';
import { assertStatsParams } from '../../shared/assert-stats-params.ts';
import { siteKey } from '../../shared/site-key.ts';
import { buildUptimeSeries } from '../../shared/uptime-series.ts';


export function getSiteUptime(user: string, siteId: string, slots: number, groupMinutes = 1): { slot: number; up: boolean | undefined }[] {
  assertStatsParams(siteId, slots, groupMinutes);
  const now = Math.floor(Date.now() / SLOT_MS);
  return buildUptimeSeries(uptime.get(siteKey(user, siteId)), now, slots, groupMinutes);
}
