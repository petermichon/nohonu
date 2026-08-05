import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, p } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { getCustomDomains as getCustomDomainsUsecase } from '../../../usecases/sites/get-custom-domains.ts';

export async function getCustomDomains(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const result = await getCustomDomainsUsecase(sessionId, p(req, 'domain') || '');
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { customDomains: result.value });
}
