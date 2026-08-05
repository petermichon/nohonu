import { session as sessionTable } from '../../db/session.ts';
import { user as userTable } from '../../db/user.ts';
import { toAuthUser } from '../../shared/auth-user.ts';

import type { MeResult } from '../../shared/me-result.ts';

export async function me(sessionId: string): Promise<MeResult> {
  const session = await sessionTable.findUnique({ where: { id: sessionId } });

  if (!session) {
    return { error: 'Invalid session' };
  }

  const user = await userTable.findUnique({ where: { username: session.username } });

  if (!user) {
    return { error: 'User not found' };
  }

  await sessionTable.updateMany({ where: { id: sessionId }, data: { lastActive: Date.now() } });

  return {
    user: toAuthUser(user),
    session: {
      id: session.id,
      deviceInfo: session.deviceInfo ?? undefined,
      userAgent: session.userAgent ?? undefined,
      createdAt: session.createdAt,
      lastActive: session.lastActive,
    },
  };
}
