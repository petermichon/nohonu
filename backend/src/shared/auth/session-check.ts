import type { Result } from '../errors.ts';

export function validateSession(
  session: { username: string; lastActive: number } | null,
  now: number,
  maxAgeMs: number,
): Result<string> {
  if (!session) return { ok: false, code: 'unauthorized', message: 'Invalid session' };
  if (session.lastActive < now - maxAgeMs) return { ok: false, code: 'unauthorized', message: 'Session expired' };
  return { ok: true, value: session.username };
}
