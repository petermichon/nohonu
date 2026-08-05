import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, requireSessionId } from '../../../shared/express/http.ts';
import { meResponse } from '../../../shared/express/me-response.ts';
import { me } from '../../../usecases/auth/me.ts';

export async function authMe(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = requireSessionId(req);
  if (!sessionId) {
    json(res, { error: 'Session ID required' }, 401);
    return;
  }
  const result = await me(sessionId);
  meResponse(res, result);
}
