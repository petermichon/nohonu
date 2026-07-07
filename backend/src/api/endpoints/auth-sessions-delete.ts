import { json, checkMethod } from '../../shared/http.ts';
import * as sessions from '../../core/auth/sessions.ts';

export async function deleteSession(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'DELETE');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');
  if (!sessionId) {
    return json({ error: 'Session ID required' }, 400);
  }

  // Get the current session to find the username
  const currentSession = await sessions.getSession(sessionId);
  if (!currentSession) {
    return json({ error: 'Invalid session' }, 401);
  }

  // Get the session ID to delete from the URL
  const url = new URL(req.url);
  const sessionToDelete = url.searchParams.get('id');
  if (!sessionToDelete) {
    return json({ error: 'Session ID to delete is required' }, 400);
  }

  // Prevent deleting the current session (use logout instead)
  if (sessionToDelete === sessionId) {
    return json({ error: 'Cannot delete current session, use logout instead' }, 400);
  }

  // Verify the session belongs to the current user
  const targetSession = await sessions.getSession(sessionToDelete);
  if (!targetSession) {
    return json({ error: 'Session not found' }, 404);
  }

  if (targetSession.username !== currentSession.username) {
    return json({ error: 'Cannot delete sessions from other users' }, 403);
  }

  await sessions.deleteSession(sessionToDelete);

  return json({ success: true });
}
