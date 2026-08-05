import { SITES_DIR } from '../../config.ts';
import { user as userTable } from '../../db/user.ts';
import { getProfilePicturePath } from '../../shared/paths.ts';

import * as fs from 'node:fs/promises';

export async function getProfilePictureFile(username: string): Promise<Uint8Array | null> {
  const user = await userTable.findUnique({ where: { username } });
  if (!user || !user.profilePicture) return null;

  try {
    const profilePicturePath = getProfilePicturePath(SITES_DIR, username);
    return new Uint8Array(await fs.readFile(profilePicturePath));
  } catch {
    return null;
  }
}
