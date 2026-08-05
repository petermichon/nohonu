import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, requireSessionId } from '../../../shared/express/http.ts';
import { logout } from '../../../usecases/auth/logout.ts';

export async function authLogout(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = requireSessionId(req);
  if (!sessionId) {
    json(res, { error: 'Session ID required' }, 401);
    return;
  }
  await logout(sessionId);
  json(res, { success: true }, 200);
}
