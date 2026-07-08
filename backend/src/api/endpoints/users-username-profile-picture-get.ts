import { CORS } from '../../shared/http.ts';
import * as users from '../../core/auth/users.ts';

export async function getProfilePicture(req: Request, username: string): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  const user = users.getUserByUsername(username);
  if (!user || !user.profilePicture) {
    return new Response('Not Found', { status: 404, headers: CORS });
  }

  try {
    const profilePicturePath = users.getProfilePicturePath(username);
    const file = await Deno.readFile(profilePicturePath);
    return new Response(file, {
      headers: { ...CORS, 'Content-Type': 'image/jpeg' },
    });
  } catch {
    return new Response('Not Found', { status: 404, headers: CORS });
  }
}
