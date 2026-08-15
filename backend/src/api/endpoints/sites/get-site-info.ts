import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { siteIdFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { getMySiteInfo } from '../../../usecases/sites/get-my-site-info.ts';

export async function getSiteInfo(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id');
  if (!sessionId) {
    json(res, { error: 'Session required' }, 401);
    return;
  }
  const result = await getMySiteInfo(sessionId, siteIdFrom(req));
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  const info = result.value;
  if (!info) {
    json(res, { error: 'Site not found' }, 404);
    return;
  }

  json(res, {
    siteId: info.siteId,
    enabled: info.enabled,
    subdomain: info.subdomain,
    subdomainBase: req.headers.host || 'localhost:8080',
    displayName: info.displayName,
    account: info.account,
    coverImage: info.coverImage,
  });
}
