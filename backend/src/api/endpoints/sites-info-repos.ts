import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteRepos(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const result = await sites.getSiteRepos(username, domain);
  if (!result) {
    return error('Site not found', 404);
  }
  return json({ domain, history: result.history });
}
