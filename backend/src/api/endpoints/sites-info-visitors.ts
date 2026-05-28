import { json } from '../../shared/http.ts';
import { getVisitors } from '../../services/analytics.ts';
import type { RouteContext } from './sites-types.ts';

export function getSiteVisitors({ domain }: RouteContext): Response {
  const visitors = getVisitors(domain);
  return json({ domain, visitors });
}
