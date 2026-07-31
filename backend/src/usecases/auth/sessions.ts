import * as sessions from '../../core/auth/sessions.ts';
import type { Session } from '../../core/auth/sessions.ts';
import type { SessionInfo } from './types.ts';
import type { UsecaseResult } from '../errors.ts';

function toSessionInfo(session: Session): SessionInfo {
  return {
    id: session.id,
    username: session.username,
    userAgent: session.userAgent,
    deviceInfo: session.deviceInfo,
    createdAt: session.createdAt,
    lastActive: session.lastActive,
  };
}

export async function listSessions(sessionId: string): Promise<UsecaseResult<SessionInfo[]>> {
  const session = await sessions.getSession(sessionId);
  if (!session) {
    return { ok: false, code: 'unauthorized', message: 'Invalid session' };
  }

  const userSessions = await sessions.getUserSessions(session.username);
  return { ok: true, value: userSessions.map(toSessionInfo) };
}

export async function deleteSession(currentSessionId: string, sessionToDeleteId: string): Promise<UsecaseResult<void>> {
  const currentSession = await sessions.getSession(currentSessionId);
  if (!currentSession) {
    return { ok: false, code: 'unauthorized', message: 'Invalid session' };
  }

  if (sessionToDeleteId === currentSessionId) {
    return { ok: false, code: 'invalid', message: 'Cannot delete current session, use logout instead' };
  }

  const targetSession = await sessions.getSession(sessionToDeleteId);
  if (!targetSession) {
    return { ok: false, code: 'not_found', message: 'Session not found' };
  }

  if (targetSession.username !== currentSession.username) {
    return { ok: false, code: 'forbidden', message: 'Cannot delete sessions from other users' };
  }

  await sessions.deleteSession(sessionToDeleteId);
  return { ok: true, value: undefined };
}
