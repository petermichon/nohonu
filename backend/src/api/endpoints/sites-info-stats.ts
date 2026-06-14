import { json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export function getSiteStats({ domain, url }: RouteContext): Response {
  const slotsParam = url.searchParams.get('slots') ?? '60';
  const slots = parseInt(slotsParam, 10);
  const count = isNaN(slots) ? 60 : slots;
  const groupParam = url.searchParams.get('group') ?? '1';
  const groupMinutes = parseInt(groupParam, 10);
  const group = isNaN(groupMinutes) ? 1 : groupMinutes;

  const stats = sites.getSiteStats(domain, count, group);
  return json({ domain, stats });
}
