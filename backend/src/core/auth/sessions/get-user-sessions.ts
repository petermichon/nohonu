import { db } from '../../../db.ts';
import type { Session } from './session.ts';

export async function getUserSessions(username: string): Promise<Session[]> {
  const sessions = await db.session.findMany({
    where: { username },
    orderBy: { createdAt: 'desc' },
  });
  return sessions.map((s) => ({
    id: s.id,
    username: s.username,
    userAgent: s.userAgent ?? undefined,
    deviceInfo: s.deviceInfo ?? undefined,
    createdAt: s.createdAt,
    lastActive: s.lastActive,
  }));
}
