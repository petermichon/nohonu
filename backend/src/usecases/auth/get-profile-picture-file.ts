import * as fs from 'node:fs/promises';
import { getUserByUsername } from '../../core/auth/users/get-user-by-username.ts';
import { getProfilePicturePath } from '../../core/auth/users/get-profile-picture-path.ts';

export async function getProfilePictureFile(username: string): Promise<Uint8Array | null> {
  const user = await getUserByUsername(username);
  if (!user || !user.profilePicture) return null;

  try {
    const profilePicturePath = getProfilePicturePath(username);
    return new Uint8Array(await fs.readFile(profilePicturePath));
  } catch {
    return null;
  }
}
