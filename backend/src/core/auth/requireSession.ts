import * as sessions from './sessions.ts';

export async function requireSession(sessionId: string | undefined): Promise<string> {
  if (!sessionId) throw new Error('Session required');
  const session = await sessions.getSession(sessionId);
  if (!session) throw new Error('Invalid session');
  await sessions.updateSessionActivity(sessionId);
  return session.username;
}
