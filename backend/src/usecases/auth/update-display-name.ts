import { session as sessionTable } from '../../db/session.ts';
import { user } from '../../db/user.ts';

import type { ProfileResult } from '../../shared/auth/profile-result.ts';

export async function updateDisplayName(sessionId: string, displayName: string): Promise<ProfileResult> {
  const session = await sessionTable.findUnique({ where: { id: sessionId } });
  if (!session) {
    return { success: false, error: 'Invalid session' };
  }

  try {
    await user.update({ where: { username: session.username }, data: { displayName } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update display name',
    };
  }
}
