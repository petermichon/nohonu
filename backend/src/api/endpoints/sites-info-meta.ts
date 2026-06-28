import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteMeta(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const meta = await sites.getSiteMeta(username, domain);
  if (!meta) {
    return error('Site not found', 404);
  }
  return json({ domain, subdomain: meta.subdomain });
}
