import * as sessions from '../../core/auth/sessions.ts';
import type { Session } from '../../core/auth/sessions.ts';

export interface ListSessionsResult {
  success: true;
  sessions: Session[];
}

export interface DeleteSessionResult {
  success: boolean;
  error?: string;
  status?: number;
}

export async function listSessions(
  sessionId: string,
): Promise<ListSessionsResult | { success: false; error: string; status: number }> {
  const session = await sessions.getSession(sessionId);
  if (!session) {
    return { success: false, error: 'Invalid session', status: 401 };
  }

  const userSessions = await sessions.getUserSessions(session.username);
  return { success: true, sessions: userSessions };
}

export async function deleteSession(
  currentSessionId: string,
  sessionToDeleteId: string,
): Promise<DeleteSessionResult> {
  const currentSession = await sessions.getSession(currentSessionId);
  if (!currentSession) {
    return { success: false, error: 'Invalid session', status: 401 };
  }

  if (sessionToDeleteId === currentSessionId) {
    return { success: false, error: 'Cannot delete current session, use logout instead', status: 400 };
  }

  const targetSession = await sessions.getSession(sessionToDeleteId);
  if (!targetSession) {
    return { success: false, error: 'Session not found', status: 404 };
  }

  if (targetSession.username !== currentSession.username) {
    return { success: false, error: 'Cannot delete sessions from other users', status: 403 };
  }

  await sessions.deleteSession(sessionToDeleteId);
  return { success: true };
}
