import { db } from '../../db.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';

export async function cleanupExpiredSessions(maxAgeMs = SESSION_MAX_AGE_MS): Promise<void> {
  const cutoff = Date.now() - maxAgeMs;
  await db.session.deleteMany({ where: { lastActive: { lt: cutoff } } });
}
