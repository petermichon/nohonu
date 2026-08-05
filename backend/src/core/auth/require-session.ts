import { session } from '../../db/session.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import type { Result } from '../../shared/errors.ts';

export async function requireSession(sessionId: string): Promise<Result<string>> {
  const sessionRecord = await session.findUnique({ where: { id: sessionId } });
  return validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
}
