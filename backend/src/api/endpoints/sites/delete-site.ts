import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { deleteSite as deleteSiteUsecase } from '../../../usecases/sites/delete-site.ts';

export async function deleteSite(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const result = await deleteSiteUsecase(sessionId, domainFrom(req));
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { domain: domainFrom(req) });
}
