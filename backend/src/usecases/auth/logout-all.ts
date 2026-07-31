import { deleteAllUserSessions } from '../../core/auth/sessions/delete-all-user-sessions.ts';

export async function logoutAll(userId: string): Promise<void> {
  await deleteAllUserSessions(userId);
}
