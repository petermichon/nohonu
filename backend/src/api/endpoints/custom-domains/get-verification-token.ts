import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, p } from '../../../shared/express/http.ts';
import { usernameFrom } from '../../../shared/express/domain-from.ts';
import { getVerificationToken as getVerificationTokenUsecase } from '../../../usecases/sites/get-verification-token.ts';

export async function getVerificationToken(req: ExpressReq, res: ExpressRes): Promise<void> {
  const siteId = p(req, 'siteId') || '';
  try {
    const result = await getVerificationTokenUsecase(usernameFrom(req), siteId);
    json(res, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get verification token';
    json(res, { error: message }, message.includes('not found') ? 404 : 400);
  }
}
