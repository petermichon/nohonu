import * as users from '../../core/auth/users.ts';
import * as sessions from '../../core/auth/sessions.ts';
import type { User } from '../../core/auth/users.ts';

export interface RegisterResult {
  success: boolean;
  user?: User;
  session?: string;
  error?: string;
}

export async function register(password: string, username: string, userAgent?: string): Promise<RegisterResult> {
  try {
    const user = await users.createUser(password, username);
    const session = sessions.createSession(user.username, userAgent);

    return {
      success: true,
      user,
      session: session.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}
