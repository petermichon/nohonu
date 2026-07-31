import { createSession } from '../../core/auth/sessions/create-session.ts';
import { validateUser } from '../../core/auth/users/validate-user.ts';
import { toAuthUser } from './to-auth-user.ts';
import type { LoginResult } from './types.ts';

export async function login(username: string, password: string, userAgent?: string): Promise<LoginResult> {
  const user = await validateUser(username, password);

  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }

  const session = await createSession(user.username, userAgent);

  return { success: true, user: toAuthUser(user), session: session.id };
}
