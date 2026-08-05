import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { userNotFound } from '../../../shared/express/user-not-found.ts';
import { getSiteInfo } from '../../../usecases/sites/get-site-info.ts';

export async function getPublicSiteInfo(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = (req.params as Record<string, string>)['username'] || '';
  const domain = (req.params as Record<string, string>)['domain'] || '';
  if (!username) {
    userNotFound(res);
    return;
  }

  const info = await getSiteInfo(username, domain);
  if (!info) {
    json(res, { error: 'Site not found' }, 404);
    return;
  }

  json(res, {
    domain,
    siteId: info.siteId,
    enabled: info.enabled,
    subdomain: info.subdomain,
    subdomainBase: req.headers.host || 'localhost:8080',
    displayName: info.displayName,
    account: info.account,
    coverImage: info.coverImage,
  });
}
