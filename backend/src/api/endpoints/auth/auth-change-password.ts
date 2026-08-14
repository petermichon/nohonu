import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { extractChangePasswordParams } from '../../../shared/express/extract-change-password-params.ts';
import { changePassword } from '../../../usecases/auth/change-password.ts';

export async function authChangePassword(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractChangePasswordParams(req);
  if (!params) {
    json(res, { error: 'Current password and a new password of at least 8 characters are required' }, 400);
    return;
  }
  const result = await changePassword(params.sessionId, params.currentPassword, params.newPassword);
  if (!result.success) {
    json(res, { error: result.error || 'Failed to change password' }, result.error === 'Current password is incorrect' ? 401 : 400);
    return;
  }
  json(res, { success: true }, 200);
}
