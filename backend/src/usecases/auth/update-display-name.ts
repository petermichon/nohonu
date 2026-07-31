import { getSession } from '../../core/auth/sessions/get-session.ts';
import { updateDisplayName as updateUserDisplayName } from '../../core/auth/users/update-display-name.ts';
import type { ProfileResult } from './types.ts';

export async function updateDisplayName(sessionId: string, displayName: string): Promise<ProfileResult> {
  const session = await getSession(sessionId);
  if (!session) {
    return { success: false, error: 'Invalid session' };
  }

  try {
    await updateUserDisplayName(session.username, displayName);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update display name',
    };
  }
}
