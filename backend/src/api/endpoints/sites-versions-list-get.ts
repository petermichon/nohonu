import { json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function listSiteVersions(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) {
    return json({ domain, versions: [], current: null });
  }
  const result = await sites.listVersions(user, domain);
  if (!result) {
    return json({ domain, versions: [], current: null });
  }
  return json({ domain, versions: result.versions, current: result.current });
}
