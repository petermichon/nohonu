import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function toggleStar(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const body = await req.json().catch(() => ({}));
  const starred = body.starred === true;

  const result = await sites.toggleStar(username, domain, starred);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, starred: result.value.starred, starCount: result.value.starCount });
}
