import { json, checkMethod } from '../../shared/http.ts';
import * as usersUc from '../../core/auth/users.ts';
import { getSession } from '../../core/auth/sessions.ts';

export async function authDisplayName(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'PATCH');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');

  if (!sessionId) {
    return json({ error: 'Session ID required' }, 401);
  }

  const session = await getSession(sessionId);

  if (!session) {
    return json({ error: 'Invalid session' }, 401);
  }

  const body = await req.json().catch(() => ({}));
  const { displayName } = body;

  if (!displayName || typeof displayName !== 'string') {
    return json({ error: 'Display name required' }, 400);
  }

  if (displayName.length > 50) {
    return json({ error: 'Display name too long (max 50 characters)' }, 400);
  }

  try {
    usersUc.updateDisplayName(session.username, displayName);
    return json({ success: true }, 200);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Failed to update display name' }, 500);
  }
}
