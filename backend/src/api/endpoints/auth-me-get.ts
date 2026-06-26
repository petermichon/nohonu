import { json, checkMethod } from '../../shared/http.ts';
import * as meUc from '../../usecases/auth/me.ts';

export function authMe(req: Request): Response {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');

  if (!sessionId) {
    return json({ error: 'Session ID required' }, 401);
  }

  const result = meUc.me(sessionId);

  if (result.error || !result.user) {
    return json({ error: result.error || 'User not found' }, 401);
  }

  return json(
    {
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        displayName: result.user.displayName,
      },
      session: result.session,
    },
    200,
  );
}
