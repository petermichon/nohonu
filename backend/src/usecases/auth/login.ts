import * as users from '../../core/auth/users.ts';
import * as sessions from '../../core/auth/sessions.ts';
import type { User } from '../../core/auth/users.ts';

export interface LoginResult {
  success: boolean;
  user?: User;
  session?: string;
  error?: string;
}

export async function login(
  username: string,
  password: string,
  deviceInfo?: string,
  userAgent?: string,
  ip?: string,
): Promise<LoginResult> {
  const user = await users.validateUser(username, password);

  if (!user) {
    return {
      success: false,
      error: 'Invalid username or password',
    };
  }

  const session = sessions.createSession(user.username, deviceInfo, userAgent, ip);

  return {
    success: true,
    user,
    session: session.id,
  };
}
