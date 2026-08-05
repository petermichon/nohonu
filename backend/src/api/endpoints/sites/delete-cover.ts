import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { deleteSiteCover } from '../../../usecases/sites/delete-site-cover.ts';

export async function deleteCover(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const result = await deleteSiteCover(sessionId, domainFrom(req));
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { success: true });
}
