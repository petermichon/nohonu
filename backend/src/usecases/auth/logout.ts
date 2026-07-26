import * as sessions from '../../core/auth/sessions.ts';

export async function logout(sessionId: string): Promise<void> {
  await sessions.deleteSession(sessionId);
}

export async function logoutAll(userId: string): Promise<void> {
  await sessions.deleteAllUserSessions(userId);
}
