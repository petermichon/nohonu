import * as fs from 'node:fs/promises';
import { error, json } from '../../shared/http.ts';
import * as users from '../../core/auth/users.ts';

export async function deleteProfilePicture(req: Request): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  try {
    const profilePicturePath = users.getProfilePicturePath(username);
    await fs.rm(profilePicturePath, { force: true });
    await users.removeProfilePicture(username);
    return json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return error(`Failed to delete profile picture: ${message}`, 500);
  }
}
