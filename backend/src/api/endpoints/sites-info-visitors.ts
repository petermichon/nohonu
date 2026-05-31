import { json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export function getSiteVisitors({ domain }: RouteContext): Response {
  const visitors = sites.getSiteVisitors(domain);
  return json({ domain, visitors });
}
