import { db } from '../../db.ts';
import { verifyPassword } from '../../shared/password.ts';
import { toAuthUser } from '../../shared/auth-user.ts';
import type { LoginResult } from './types.ts';

export async function login(username: string, password: string, userAgent?: string): Promise<LoginResult> {
  const user = await db.user.findUnique({ where: { username } });
  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: 'Invalid username or password' };
  }

  const session = await db.session.create({
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
