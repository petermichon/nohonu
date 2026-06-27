import * as sessions from '../../core/auth/sessions.ts';

export async function logout(sessionId: string): Promise<void> {
  await sessions.deleteSession(sessionId);
}

export function logoutAll(userId: string): void {
  sessions.deleteAllUserSessions(userId);
}
