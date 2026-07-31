import { getSession } from '../../core/auth/sessions/get-session.ts';
import { getUserSessions } from '../../core/auth/sessions/get-user-sessions.ts';
import type { Session } from '../../core/auth/sessions/session.ts';
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
  const session = await getSession(sessionId);
  if (!session) {
    return { ok: false, code: 'unauthorized', message: 'Invalid session' };
  }

  const userSessions = await getUserSessions(session.username);
  return { ok: true, value: userSessions.map(toSessionInfo) };
}
