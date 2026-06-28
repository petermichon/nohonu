import { error, json, parseJson } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function updateMeta(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const body = await parseJson<{ subdomain?: string | undefined }>(req);
  if (body instanceof Response) return body;

  const result = await sites.updateSiteMeta(username, domain, body);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, subdomain: body.subdomain });
}
