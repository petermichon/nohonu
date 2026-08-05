import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { deleteSession as deleteSessionUsecase } from '../../../usecases/auth/delete-session.ts';

export async function deleteSession(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id');
  if (!sessionId) {
    json(res, { error: 'Session ID required' }, 400);
    return;
  }
  const sessionToDelete = req.query.id as string;
  if (!sessionToDelete) {
    json(res, { error: 'Session ID to delete is required' }, 400);
    return;
  }
  const result = await deleteSessionUsecase(sessionId, sessionToDelete);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { success: true });
}
