import { json } from '../../shared/http.ts';
import { getUptime } from '../../services/analytics.ts';
import type { RouteContext } from './sites-types.ts';

export function getSiteUptime({ domain, url }: RouteContext): Response {
  const slotsParam = url.searchParams.get('slots') ?? '60';
  const slots = parseInt(slotsParam, 10);

  let count: number;
  if (isNaN(slots)) {
    count = 60;
  } else {
    count = slots;
  }

  const uptime = getUptime(domain, count);
  return json({ domain, uptime });
}
