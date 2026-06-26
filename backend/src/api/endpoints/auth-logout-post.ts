import { json, checkMethod } from '../../shared/http.ts';
import * as logoutUc from '../../usecases/auth/logout.ts';

export function authLogout(req: Request): Response {
  const methodError = checkMethod(req, 'POST');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');

  if (!sessionId) {
    return json({ error: 'Session ID required' }, 400);
  }

  logoutUc.logout(sessionId);

  return json({ success: true }, 200);
}
