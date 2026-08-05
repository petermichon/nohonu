import { SITES_DIR } from '../../config.ts';
import { session as sessionTable } from '../../db/session.ts';
import { user } from '../../db/user.ts';
import { getProfilePicturePath } from '../../shared/paths.ts';

import * as fs from 'node:fs/promises';

import type { ProfileResult } from '../../shared/profile-result.ts';

export async function deleteProfilePicture(sessionId: string): Promise<ProfileResult> {
  const session = await sessionTable.findUnique({ where: { id: sessionId } });
  if (!session) {
    return { success: false, error: 'Invalid session' };
  }
  const username = session.username;

  try {
    const profilePicturePath = getProfilePicturePath(SITES_DIR, username);
    await fs.rm(profilePicturePath, { force: true });
    await user.update({ where: { username }, data: { profilePicture: null } });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to delete profile picture: ${message}` };
  }
}
