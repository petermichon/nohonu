import * as users from '../../core/auth/users.ts';
import * as sessions from '../../core/auth/sessions.ts';
import type { User } from '../../core/auth/users.ts';

export interface LoginResult {
  success: boolean;
  user?: User;
  session?: string;
  error?: string;
}

export interface RegisterResult {
  success: boolean;
  user?: User;
  session?: string;
  error?: string;
}

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

export async function login(username: string, password: string, userAgent?: string): Promise<LoginResult> {
  const user = await users.validateUser(username, password);

  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }

  const session = await sessions.createSession(user.username, userAgent);

  return { success: true, user, session: session.id };
}

export async function register(password: string, username: string, userAgent?: string): Promise<RegisterResult> {
  try {
    const user = await users.createUser(password, username);
    const session = await sessions.createSession(user.username, userAgent);

    return { success: true, user, session: session.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

export async function logout(sessionId: string): Promise<void> {
  await sessions.deleteSession(sessionId);
}

export async function logoutAll(userId: string): Promise<void> {
  await sessions.deleteAllUserSessions(userId);
}

export async function me(sessionId: string): Promise<MeResult> {
  const session = await sessions.getSession(sessionId);

  if (!session) {
    return { error: 'Invalid session' };
  }

  const user = await users.getUserByUsername(session.username);

  if (!user) {
    return { error: 'User not found' };
  }

  await sessions.updateSessionActivity(sessionId);

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
