import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { listMySites } from '../../../usecases/sites/list-my-sites.ts';

export async function listSites(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id');
  if (!sessionId) {
    json(res, { error: 'Session required' }, 401);
    return;
  }
  const result = await listMySites(sessionId);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { sites: result.value });
}
