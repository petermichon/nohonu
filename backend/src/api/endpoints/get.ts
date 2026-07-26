import { CORS, extractClientIp } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';

export async function serveStatic(req: Request, path: string, info: { remoteAddr: { hostname?: string } }): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  const host = req.headers.get('Host') ?? '';
  const resolved = await sites.resolveDomainAndServe(host, path);
  if (!resolved) return new Response('Not Found', { status: 404, headers: CORS });

  const result = await sites.serveSiteFile(resolved.user, resolved.domain, resolved.filePath);
  if (!result) return new Response('Site not found', { status: 404, headers: CORS });

  if (result.contentType === 'text/html') {
    const ip = extractClientIp(req, info.remoteAddr);
    sites.recordPageHit(resolved.domain, ip);
  }

  const responseHeaders = { ...CORS, 'Content-Type': result.contentType };
  return new Response(result.data as BodyInit, { headers: responseHeaders });
}
