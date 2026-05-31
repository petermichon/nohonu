import { json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function listSiteVersions({ domain }: RouteContext): Promise<Response> {
  const result = await sites.listVersions(domain);
  if (!result) {
    return json({ domain, versions: [], current: null });
  }
  return json({ domain, versions: result.versions, current: result.current });
}
