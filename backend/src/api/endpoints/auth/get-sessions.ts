import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, requireSessionId } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { listSessions } from '../../../usecases/auth/list-sessions.ts';

export async function getSessions(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = requireSessionId(req);
  if (!sessionId) {
    json(res, { error: 'Session ID required' }, 400);
    return;
  }
  const result = await listSessions(sessionId);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { sessions: result.value });
}
