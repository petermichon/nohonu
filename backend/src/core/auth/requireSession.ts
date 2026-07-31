import { getSession } from './sessions/get-session.ts';
import { updateSessionActivity } from './sessions/update-session-activity.ts';

export async function requireSession(sessionId: string | undefined): Promise<string> {
  if (!sessionId) throw new Error('Session required');
  const session = await getSession(sessionId);
  if (!session) throw new Error('Invalid session');
  await updateSessionActivity(sessionId);
  return session.username;
}
