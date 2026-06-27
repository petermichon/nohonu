import * as sessions from '../../core/auth/sessions.ts';
import * as users from '../../core/auth/users.ts';
import type { User } from '../../core/auth/users.ts';

export interface MeResult {
  user?: User;
  session?: {
    id: string;
    deviceInfo?: string;
    userAgent?: string;
    createdAt: number;
    lastActive: number;
  };
  error?: string;
}

export function me(sessionId: string): MeResult {
  const session = sessions.getSession(sessionId);

  if (!session) {
    return { error: 'Invalid session' };
  }

  const user = users.getUserByUsername(session.username);

  if (!user) {
    return { error: 'User not found' };
  }

  sessions.updateSessionActivity(sessionId);

  return {
    user,
    session: {
      id: session.id,
      deviceInfo: session.deviceInfo,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      lastActive: session.lastActive,
    },
  };
}
