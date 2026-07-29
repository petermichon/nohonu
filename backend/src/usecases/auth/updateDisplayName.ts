import * as sessions from '../../core/auth/sessions.ts';
import * as users from '../../core/auth/users.ts';

export interface UpdateDisplayNameResult {
  success: boolean;
  error?: string;
}

export async function updateDisplayName(
  sessionId: string,
  displayName: string,
): Promise<UpdateDisplayNameResult> {
  const session = await sessions.getSession(sessionId);
  if (!session) {
    return { success: false, error: 'Invalid session' };
  }

  try {
    await users.updateDisplayName(session.username, displayName);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update display name',
    };
  }
}
