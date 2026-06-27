import { json, checkMethod } from '../../shared/http.ts';
import * as meUc from '../../usecases/auth/me.ts';

export async function authMe(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');

  if (!sessionId) {
    return json({ error: 'Session ID required' }, 401);
  }

  const result = await meUc.me(sessionId);

  if (result.error || !result.user) {
    return json({ error: result.error || 'User not found' }, 401);
  }

  return json(
    {
      user: {
        email: result.user.email,
        username: result.user.username,
        displayName: result.user.displayName,
      },
      session: result.session,
    },
    200,
  );
}
