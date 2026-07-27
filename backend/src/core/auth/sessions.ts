import { db } from '../../db.ts';

export interface Session {
  id: string;
  username: string;
  userAgent?: string;
  deviceInfo?: string;
  createdAt: number;
  lastActive: number;
}

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

export async function updateSessionActivity(id: string): Promise<void> {
  await db.session.updateMany({ where: { id }, data: { lastActive: Date.now() } });
}

export async function deleteSession(id: string): Promise<void> {
  await db.session.deleteMany({ where: { id } });
}

export async function deleteAllUserSessions(username: string): Promise<void> {
  await db.session.deleteMany({ where: { username } });
}

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

export async function cleanupExpiredSessions(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
  const cutoff = Date.now() - maxAgeMs;
  await db.session.deleteMany({
    where: { lastActive: { lt: cutoff } },
  });
}
