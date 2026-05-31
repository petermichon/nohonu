import { json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export function getSiteStats({ domain, url }: RouteContext): Response {
  const slotsParam = url.searchParams.get('slots') ?? '60';
  const slots = parseInt(slotsParam, 10);
  const count = isNaN(slots) ? 60 : slots;

  const stats = sites.getSiteStats(domain, count);
  return json({ domain, stats });
}
