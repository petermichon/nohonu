import * as sessions from '../../core/auth/sessions.ts';

export function logout(sessionId: string): void {
  sessions.deleteSession(sessionId);
}

export function logoutAll(userId: string): void {
  sessions.deleteAllUserSessions(userId);
}
