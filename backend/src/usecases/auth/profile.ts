import * as fs from 'node:fs/promises';
import * as sessions from '../../core/auth/sessions.ts';
import * as users from '../../core/auth/users/index.ts';
import { requireSession } from '../../core/auth/requireSession.ts';

export interface ProfileResult {
  success: boolean;
  error?: string;
}

export async function updateDisplayName(sessionId: string, displayName: string): Promise<ProfileResult> {
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

export async function uploadProfilePicture(
  sessionId: string,
  contentType: string,
  data: ArrayBuffer,
): Promise<ProfileResult> {
  const username = await requireSession(sessionId);
  if (!contentType.startsWith('image/')) {
    return { success: false, error: 'Invalid content type, must be an image' };
  }

  if (data.byteLength > 5_242_880) {
    return { success: false, error: 'Image too large, max 5MB' };
  }

  try {
    const profilePicturePath = users.getProfilePicturePath(username);
    await fs.writeFile(profilePicturePath, new Uint8Array(data));
    await users.setProfilePicture(username);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to upload profile picture: ${message}` };
  }
}

export async function deleteProfilePicture(sessionId: string): Promise<ProfileResult> {
  const username = await requireSession(sessionId);
  try {
    const profilePicturePath = users.getProfilePicturePath(username);
    await fs.rm(profilePicturePath, { force: true });
    await users.removeProfilePicture(username);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to delete profile picture: ${message}` };
  }
}
