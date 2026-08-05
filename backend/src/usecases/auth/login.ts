import { session as sessionTable } from '../../db/session.ts';
import { user as userTable } from '../../db/user.ts';
import { toAuthUser } from '../../shared/auth/auth-user.ts';
import { verifyPassword } from '../../shared/auth/password.ts';

import type { LoginResult } from '../../shared/auth/login-result.ts';

export async function login(username: string, password: string, userAgent?: string): Promise<LoginResult> {
  const user = await userTable.findUnique({ where: { username } });
  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: 'Invalid username or password' };
  }

  const session = await sessionTable.create({
    data: {
      id: crypto.randomUUID(),
      username,
      userAgent: userAgent ?? null,
      deviceInfo: null,
      createdAt: Date.now(),
      lastActive: Date.now(),
    },
  });

  return { success: true, user: toAuthUser(user), session: session.id };
}
