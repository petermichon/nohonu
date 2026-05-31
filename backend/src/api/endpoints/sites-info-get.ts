import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteInfo({ domain }: RouteContext): Promise<Response> {
  const info = await sites.getSiteInfo(domain);
  if (!info) {
    return error('Site not found', 404);
  }
  return json({ domain, enabled: info.enabled });
}
