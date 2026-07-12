import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import { SUBDOMAIN_BASE } from '../../shared/paths.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteInfo(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const info = await sites.getSiteInfo(username, domain);
  if (!info) {
    return error('Site not found', 404);
  }

  // Derive subdomainBase from request host if not set via environment variable
  let subdomainBase = SUBDOMAIN_BASE;
  if (subdomainBase === 'localhost:8080') {
    const url = new URL(req.url);
    const host = url.hostname;
    const port = url.port;
    subdomainBase = port ? `${host}:${port}` : host;
  }

  return json({
    domain,
    siteId: info.siteId,
    enabled: info.enabled,
    subdomain: info.subdomain,
    subdomainBase,
    displayName: info.displayName,
    account: info.account,
    coverImage: info.coverImage,
  });
}
