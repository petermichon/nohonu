import { json, checkMethod } from '../../shared/http.ts';
import * as logoutUc from '../../usecases/auth/logout.ts';

export async function authLogout(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'POST');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');

  if (!sessionId) {
    return json({ error: 'Session ID required' }, 400);
  }

  await logoutUc.logout(sessionId);

  return json({ success: true }, 200);
}
