import * as fs from 'node:fs/promises';
import { error, json } from '../../shared/http.ts';
import * as users from '../../core/auth/users.ts';

export async function uploadProfilePicture(req: Request): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const contentType = req.headers.get('Content-Type');
  if (!contentType?.startsWith('image/')) {
    return error('Invalid content type, must be an image', 400);
  }

  const body = await req.arrayBuffer();
  if (body.byteLength > 5_242_880) {
    return error('Image too large, max 5MB', 400);
  }

  try {
    const profilePicturePath = users.getProfilePicturePath(username);
    await fs.writeFile(profilePicturePath, new Uint8Array(body));
    users.setProfilePicture(username);
    return json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return error(`Failed to upload profile picture: ${message}`, 500);
  }
}
