import { json, checkMethod } from '../../shared/http.ts';
import { getUserByUsername } from '../../core/auth/users.ts';

export function getUserByUsernameEndpoint(req: Request, path: string): Response {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return methodError;

  const parts = path.split('/').filter(Boolean);
  const username = parts[1];

  if (!username) {
    return json({ error: 'Username required' }, 400);
  }

  const user = getUserByUsername(username);

  if (!user) {
    return json({ error: 'User not found' }, 404);
  }

  return json(
    {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      },
    },
    200,
  );
}
