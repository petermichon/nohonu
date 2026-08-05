import { session as sessionTable } from '../../db/session.ts';
import { toSessionInfo } from '../../shared/to-session-info.ts';

import type { SessionInfo } from '../../shared/session-info.ts';

import type { Result } from '../../shared/errors.ts';

export async function listSessions(sessionId: string): Promise<Result<SessionInfo[]>> {
  const session = await sessionTable.findUnique({ where: { id: sessionId } });
  if (!session) {
    return { ok: false, code: 'unauthorized', message: 'Invalid session' };
  }

  const userSessions = await sessionTable.findMany({
    where: { username: session.username },
    orderBy: { createdAt: 'desc' },
  });
  return { ok: true, value: userSessions.map(toSessionInfo) };
}
