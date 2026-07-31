import { getSession } from '../../core/auth/sessions/get-session.ts';
import { updateSessionActivity } from '../../core/auth/sessions/update-session-activity.ts';
import { getUserByUsername } from '../../core/auth/users/get-user-by-username.ts';
import { toAuthUser } from './to-auth-user.ts';
import type { MeResult } from './types.ts';

export async function me(sessionId: string): Promise<MeResult> {
  const session = await getSession(sessionId);

  if (!session) {
    return { error: 'Invalid session' };
  }

  const user = await getUserByUsername(session.username);

  if (!user) {
    return { error: 'User not found' };
  }

  await updateSessionActivity(sessionId);

  return {
    user: toAuthUser(user),
    session: {
      id: session.id,
      deviceInfo: session.deviceInfo,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      lastActive: session.lastActive,
    },
  };
}
