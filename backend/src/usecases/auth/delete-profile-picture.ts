import * as fs from 'node:fs/promises';
import { requireSession } from '../../core/auth/requireSession.ts';
import { getProfilePicturePath } from '../../core/auth/users/get-profile-picture-path.ts';
import { removeProfilePicture } from '../../core/auth/users/remove-profile-picture.ts';
import type { ProfileResult } from './types.ts';

export async function deleteProfilePicture(sessionId: string): Promise<ProfileResult> {
  const username = await requireSession(sessionId);
  try {
    const profilePicturePath = getProfilePicturePath(username);
    await fs.rm(profilePicturePath, { force: true });
    await removeProfilePicture(username);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to delete profile picture: ${message}` };
  }
}
