import { getSession } from '../../core/auth/sessions/get-session.ts';
import { deleteSession as deleteSessionRecord } from '../../core/auth/sessions/delete-session.ts';
import type { UsecaseResult } from '../errors.ts';

export async function deleteSession(currentSessionId: string, sessionToDeleteId: string): Promise<UsecaseResult<void>> {
  const currentSession = await getSession(currentSessionId);
  if (!currentSession) {
    return { ok: false, code: 'unauthorized', message: 'Invalid session' };
  }

  if (sessionToDeleteId === currentSessionId) {
    return { ok: false, code: 'invalid', message: 'Cannot delete current session, use logout instead' };
  }

  const targetSession = await getSession(sessionToDeleteId);
  if (!targetSession) {
    return { ok: false, code: 'not_found', message: 'Session not found' };
  }

  if (targetSession.username !== currentSession.username) {
    return { ok: false, code: 'forbidden', message: 'Cannot delete sessions from other users' };
  }

  await deleteSessionRecord(sessionToDeleteId);
  return { ok: true, value: undefined };
}
