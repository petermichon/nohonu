import { db } from '../../db.ts';
import type { Result } from '../errors.ts';

export async function requireSession(sessionId: string | undefined): Promise<Result<string>> {
  if (!sessionId) return { ok: false, code: 'unauthorized', message: 'Session required' };
  const session = await db.session.findUnique({ where: { id: sessionId } });
  if (!session) return { ok: false, code: 'unauthorized', message: 'Invalid session' };
  await db.session.updateMany({ where: { id: sessionId }, data: { lastActive: Date.now() } });
  return { ok: true, value: session.username };
}
