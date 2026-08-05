import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { indexFrom } from '../../../shared/express/index-from.ts';
import { activateVersion as activateVersionUsecase } from '../../../usecases/sites/activate-version.ts';

export async function activateVersion(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const idx = indexFrom(req);
  if (idx === undefined) {
    json(res, { error: 'Invalid index' }, 400);
    return;
  }

  const result = await activateVersionUsecase(sessionId, domainFrom(req), idx);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { domain: domainFrom(req), index: idx });
}
