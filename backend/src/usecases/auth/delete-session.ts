import { session } from '../../db/session.ts';

import type { Result } from '../../shared/errors.ts';

export async function deleteSession(currentSessionId: string, sessionToDeleteId: string): Promise<Result<void>> {
  const currentSession = await session.findUnique({ where: { id: currentSessionId } });
  if (!currentSession) {
    return { ok: false, code: 'unauthorized', message: 'Invalid session' };
  }

  if (sessionToDeleteId === currentSessionId) {
    return { ok: false, code: 'invalid', message: 'Cannot delete current session, use logout instead' };
  }

  const targetSession = await session.findUnique({ where: { id: sessionToDeleteId } });
  if (!targetSession) {
    return { ok: false, code: 'not_found', message: 'Session not found' };
  }

  if (targetSession.username !== currentSession.username) {
    return { ok: false, code: 'forbidden', message: 'Cannot delete sessions from other users' };
  }

  await session.deleteMany({ where: { id: sessionToDeleteId } });
  return { ok: true, value: undefined };
}
