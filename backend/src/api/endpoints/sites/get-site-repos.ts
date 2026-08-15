import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { siteIdFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { getSiteRepos as getSiteReposUsecase } from '../../../usecases/sites/get-site-repos.ts';

export async function getSiteRepos(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const result = await getSiteReposUsecase(sessionId, siteIdFrom(req));
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  const value = result.value;
  if (!value) {
    json(res, { error: 'Site not found' }, 404);
    return;
  }
  json(res, { siteId: siteIdFrom(req), history: value.history });
}
