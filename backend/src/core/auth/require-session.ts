import { db } from '../../db.ts';
import type { Result } from '../../shared/errors.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';

export async function requireSession(sessionId: string | undefined): Promise<Result<string>> {
  if (!sessionId) return { ok: false, code: 'unauthorized', message: 'Session required' };
  const session = await db.session.findUnique({ where: { id: sessionId } });
  return validateSession(session, Date.now(), SESSION_MAX_AGE_MS);
}
