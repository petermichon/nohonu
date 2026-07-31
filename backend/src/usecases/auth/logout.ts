import { deleteSession } from '../../core/auth/sessions/delete-session.ts';

export async function logout(sessionId: string): Promise<void> {
  await deleteSession(sessionId);
}
