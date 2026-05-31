import { CORS } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteIcon({ domain }: RouteContext): Promise<Response> {
  const result = await sites.getSiteIcon(domain);
  if (!result) {
    return new Response(undefined, { status: 404, headers: CORS });
  }
  const headers = { ...CORS, 'Content-Type': result.contentType, 'Cache-Control': 'public, max-age=300' };
  return new Response(result.data.buffer as ArrayBuffer, { headers });
}
