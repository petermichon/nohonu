import * as sessions from '../core/auth/sessions.ts';
import { json } from '../shared/http.ts';

export const API_KEY = process.env['API_KEY'];

export async function requireAuth(req: Request): Promise<Response | undefined> {
  if (API_KEY && req.headers.get('X-Api-Key') === API_KEY) return undefined;

  const sessionId = req.headers.get('X-Session-Id');
  if (sessionId) {
    const session = await sessions.getSession(sessionId);
    if (!session) return json({ error: 'Invalid session' }, 401);
    await sessions.updateSessionActivity(sessionId);
    return undefined;
  }

  if (!API_KEY) return undefined;
  return json({ error: 'Unauthorized' }, 401);
}
