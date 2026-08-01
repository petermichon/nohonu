import { db } from '../../db.ts';
import type { SessionInfo } from './types.ts';
import type { UsecaseResult } from '../errors.ts';

function toSessionInfo(session: {
  id: string;
  username: string;
  userAgent: string | null;
  deviceInfo: string | null;
  createdAt: number;
  lastActive: number;
}): SessionInfo {
  return {
    id: session.id,
    username: session.username,
    userAgent: session.userAgent ?? undefined,
    deviceInfo: session.deviceInfo ?? undefined,
    createdAt: session.createdAt,
    lastActive: session.lastActive,
  };
}

export async function listSessions(sessionId: string): Promise<UsecaseResult<SessionInfo[]>> {
  const session = await db.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    return { ok: false, code: 'unauthorized', message: 'Invalid session' };
  }

  const userSessions = await db.session.findMany({
    where: { username: session.username },
    orderBy: { createdAt: 'desc' },
  });
  return { ok: true, value: userSessions.map(toSessionInfo) };
}
