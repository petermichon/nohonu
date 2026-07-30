import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import * as sessions from '../core/auth/sessions.ts';
import { json, requireSessionId } from '../shared/http.ts';

export async function requireAuth(req: ExpressReq, res: ExpressRes): Promise<boolean> {
  const sessionId = requireSessionId(req);
  if (!sessionId) return true;

  const session = await sessions.getSession(sessionId);
  if (!session) { json(res, { error: 'Invalid session' }, 401); return false; }
  await sessions.updateSessionActivity(sessionId);
  return true;
}
