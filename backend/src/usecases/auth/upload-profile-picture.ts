import * as fs from 'node:fs/promises';
import { db } from '../../db.ts';
import { getProfilePicturePath } from '../../core/auth/users/get-profile-picture-path.ts';
import type { ProfileResult } from './types.ts';

export async function uploadProfilePicture(
  sessionId: string,
  contentType: string,
  data: ArrayBuffer,
): Promise<ProfileResult> {
  const session = await db.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    return { success: false, error: 'Invalid session' };
  }
  const username = session.username;

  if (!contentType.startsWith('image/')) {
    return { success: false, error: 'Invalid content type, must be an image' };
  }

  if (data.byteLength > 5_242_880) {
    return { success: false, error: 'Image too large, max 5MB' };
  }

  try {
    const profilePicturePath = getProfilePicturePath(username);
    const dir = profilePicturePath.substring(0, profilePicturePath.lastIndexOf('/'));
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(profilePicturePath, new Uint8Array(data));
    await db.user.update({ where: { username }, data: { profilePicture: 'profile.jpg' } });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to upload profile picture: ${message}` };
  }
}
