import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { getSiteMeta as getSiteMetaUsecase } from '../../../usecases/sites/get-site-meta.ts';

export async function getSiteMeta(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const result = await getSiteMetaUsecase(sessionId, domainFrom(req));
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  const meta = result.value;
  if (!meta) {
    json(res, { error: 'Site not found' }, 404);
    return;
  }
  json(res, { domain: domainFrom(req), subdomain: meta.subdomain });
}
