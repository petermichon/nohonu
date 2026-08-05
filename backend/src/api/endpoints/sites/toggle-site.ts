import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { toggleSite as toggleSiteUsecase } from '../../../usecases/sites/toggle-site.ts';

export async function toggleSite(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const result = await toggleSiteUsecase(sessionId, domainFrom(req));
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { domain: domainFrom(req), enabled: result.value.enabled });
}
