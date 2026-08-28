import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { extractDeleteAccountParams } from '../../../shared/express/extract-delete-account-params.ts';
import { deleteAccount } from '../../../usecases/auth/delete-account.ts';

export async function authDeleteAccount(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractDeleteAccountParams(req);
  if (!params) {
    json(res, { error: 'Password is required' }, 400);
    return;
  }
  const result = await deleteAccount(params.sessionId, params.password);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { success: true }, 200);
}