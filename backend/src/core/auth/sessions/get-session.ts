import { db } from '../../../db.ts';
import type { Session } from './session.ts';

export async function getSession(id: string): Promise<Session | null> {
  const session = await db.session.findUnique({ where: { id } });
  if (!session) return null;
  return {
    id: session.id,
    username: session.username,
    userAgent: session.userAgent ?? undefined,
    deviceInfo: session.deviceInfo ?? undefined,
    createdAt: session.createdAt,
    lastActive: session.lastActive,
  };
}
