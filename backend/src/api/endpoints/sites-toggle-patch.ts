import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function toggleSite({ domain }: RouteContext): Promise<Response> {
  const result = await sites.toggleSite(domain);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, enabled: result.value.enabled });
}
