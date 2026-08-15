import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, parseJson, p } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { requireCustomDomain } from '../../../shared/require-custom-domain.ts';
import { addCustomDomain as addCustomDomainUsecase } from '../../../usecases/sites/add-custom-domain.ts';

export async function addCustomDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const body = await parseJson<{ customDomain: string }>(req);
  if (!body || !body.customDomain) {
    json(res, { error: 'customDomain is required' }, 400);
    return;
  }

  const customDomain = requireCustomDomain(body.customDomain);
  if (!customDomain) {
    json(res, { error: 'Invalid custom domain format' }, 400);
    return;
  }

  const result = await addCustomDomainUsecase(sessionId, p(req, 'siteId') || '', customDomain);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { siteId: p(req, 'siteId') || '', customDomain, verified: false });
}
