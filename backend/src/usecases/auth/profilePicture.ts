import * as fs from 'node:fs/promises';
import * as users from '../../core/auth/users.ts';

export interface ProfilePictureResult {
  success: boolean;
  error?: string;
}

export async function uploadProfilePicture(
  username: string,
  contentType: string,
  data: ArrayBuffer,
): Promise<ProfilePictureResult> {
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

export async function deleteProfilePicture(username: string): Promise<ProfilePictureResult> {
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
