import { db } from '../../db.ts';

export async function requireSession(sessionId: string | undefined): Promise<string> {
  if (!sessionId) throw new Error('Session required');
  const session = await db.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error('Invalid session');
  await db.session.updateMany({ where: { id: sessionId }, data: { lastActive: Date.now() } });
  return session.username;
}
