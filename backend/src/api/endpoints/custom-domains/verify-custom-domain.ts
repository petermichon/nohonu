import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, p } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { requireCustomDomain } from '../../../shared/sites/require-custom-domain.ts';
import { verifyCustomDomain as verifyCustomDomainUsecase } from '../../../usecases/sites/verify-custom-domain.ts';

export async function verifyCustomDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const customDomain = requireCustomDomain(p(req, 'subAction'));
  if (!customDomain) {
    json(res, { error: 'Invalid custom domain format' }, 400);
    return;
  }

  const result = await verifyCustomDomainUsecase(sessionId, p(req, 'domain') || '', customDomain);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { domain: p(req, 'domain') || '', customDomain, verified: result.value.verified });
}
