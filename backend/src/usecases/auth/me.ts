import { db } from '../../db.ts';
import { toAuthUser } from './to-auth-user.ts';
import type { MeResult } from './types.ts';

export async function me(sessionId: string): Promise<MeResult> {
  const session = await db.session.findUnique({ where: { id: sessionId } });

  if (!session) {
    return { error: 'Invalid session' };
  }

  const user = await db.user.findUnique({ where: { username: session.username } });

  if (!user) {
    return { error: 'User not found' };
  }

  await db.session.updateMany({ where: { id: sessionId }, data: { lastActive: Date.now() } });

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
