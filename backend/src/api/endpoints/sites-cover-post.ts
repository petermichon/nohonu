import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function uploadCover(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const contentType = req.headers.get('Content-Type');
  if (!contentType?.startsWith('image/')) {
    return error('Invalid content type, must be an image', 400);
  }

  const body = await req.arrayBuffer();
  if (body.byteLength > 5_242_880) { // 5MB limit
    return error('Image too large, max 5MB', 400);
  }

  const result = await sites.uploadSiteCover(username, domain, new Uint8Array(body));
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ success: true });
}
