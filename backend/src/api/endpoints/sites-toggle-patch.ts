import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function toggleSite({ domain }: RouteContext): Promise<Response> {
  try {
    const result = await sites.toggleSite(domain);
    return json({ domain, enabled: result.enabled });
  } catch {
    return error('Site not found', 404);
  }
}
