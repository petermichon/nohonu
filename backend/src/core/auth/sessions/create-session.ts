import { db } from '../../../db.ts';
import type { Session } from './session.ts';

export async function createSession(username: string, userAgent?: string, deviceInfo?: string): Promise<Session> {
  const session = await db.session.create({
    data: {
      id: crypto.randomUUID(),
      username,
      userAgent: userAgent ?? null,
      deviceInfo: deviceInfo ?? null,
      createdAt: Date.now(),
      lastActive: Date.now(),
    },
  });

  return {
    id: session.id,
    username: session.username,
    userAgent: session.userAgent ?? undefined,
    deviceInfo: session.deviceInfo ?? undefined,
    createdAt: session.createdAt,
    lastActive: session.lastActive,
  };
}
