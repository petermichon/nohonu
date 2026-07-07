import { json, checkMethod } from '../../shared/http.ts';
import * as sessions from '../../core/auth/sessions.ts';

export async function getSessions(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');
  if (!sessionId) {
    return json({ error: 'Session ID required' }, 400);
  }

  // Get the session to find the username
  const session = await sessions.getSession(sessionId);
  if (!session) {
    return json({ error: 'Invalid session' }, 401);
  }

  // Get all sessions for this user
  const userSessions = sessions.getUserSessions(session.username);

  return json({ sessions: userSessions });
}
