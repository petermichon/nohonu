import * as fs from 'node:fs/promises';
import { db } from '../../db.ts';
import { SITES_DIR, getProfilePicturePath } from '../../shared/paths.ts';

export async function getProfilePictureFile(username: string): Promise<Uint8Array | null> {
  const user = await db.user.findUnique({ where: { username } });
  if (!user || !user.profilePicture) return null;

  try {
    const profilePicturePath = getProfilePicturePath(SITES_DIR, username);
    return new Uint8Array(await fs.readFile(profilePicturePath));
  } catch {
    return null;
  }
}
