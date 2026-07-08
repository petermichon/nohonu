import { CORS } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteCover(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) {
    return new Response(undefined, { status: 404, headers: CORS });
  }
  const result = await sites.getSiteCover(user, domain);
  if (!result) {
    return new Response(undefined, { status: 404, headers: CORS });
  }
  const headers = { ...CORS, 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=300' };
  return new Response(result.buffer as ArrayBuffer, { headers });
}
