import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function activateVersion(req: Request, { domain, timestamp: index }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  if (!index || isNaN(index)) return error('Invalid index');
  const result = await sites.activateVersion(username, domain, index);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, index });
}
