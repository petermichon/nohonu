import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { session } from '../../db/session.ts';

export async function cleanupExpiredSessions(maxAgeMs = SESSION_MAX_AGE_MS): Promise<void> {
  const cutoff = Date.now() - maxAgeMs;
  await session.deleteMany({ where: { lastActive: { lt: cutoff } } });
}
