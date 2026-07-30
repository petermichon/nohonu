import * as sessions from '../core/auth/sessions.ts';
import { json } from '../shared/http.ts';

export async function requireAuth(req: Request): Promise<Response | undefined> {
  const sessionId = req.headers.get('X-Session-Id');
  if (!sessionId) return undefined;

  const session = await sessions.getSession(sessionId);
  if (!session) return json({ error: 'Invalid session' }, 401);
  await sessions.updateSessionActivity(sessionId);
  return undefined;
}
