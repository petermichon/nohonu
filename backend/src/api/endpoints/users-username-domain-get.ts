import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import * as storage from '../../core/sites/storage.ts';
import { SUBDOMAIN_BASE } from '../../shared/paths.ts';

export async function getPublicSiteInfo(req: Request, username: string, domain: string): Promise<Response> {
  const users = await storage.listUsers();
  if (!users.includes(username)) {
    return error('User not found', 404);
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
  });
}
