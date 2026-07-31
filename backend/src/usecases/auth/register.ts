import { createSession } from '../../core/auth/sessions/create-session.ts';
import { createUser } from '../../core/auth/users/create-user.ts';
import { toAuthUser } from './to-auth-user.ts';
import type { RegisterResult } from './types.ts';

export async function register(password: string, username: string, userAgent?: string): Promise<RegisterResult> {
  try {
    const user = await createUser(password, username);
    const session = await createSession(user.username, userAgent);

    return { success: true, user: toAuthUser(user), session: session.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}
