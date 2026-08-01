import { db } from '../../db.ts';
import type { ProfileResult } from './types.ts';

export async function updateDisplayName(sessionId: string, displayName: string): Promise<ProfileResult> {
  const session = await db.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    return { success: false, error: 'Invalid session' };
  }

  try {
    await db.user.update({ where: { username: session.username }, data: { displayName } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update display name',
    };
  }
}
