import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function deleteCover(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const result = await sites.deleteSiteCover(username, domain);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ success: true });
}
