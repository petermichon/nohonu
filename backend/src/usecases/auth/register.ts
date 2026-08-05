import { session as sessionTable } from '../../db/session.ts';
import { user as userTable } from '../../db/user.ts';
import { toAuthUser } from '../../shared/auth-user.ts';
import { hashPassword } from '../../shared/password.ts';

import type { RegisterResult } from '../../shared/register-result.ts';

export async function register(password: string, username: string, userAgent?: string): Promise<RegisterResult> {
  try {
    const existing = await userTable.findUnique({ where: { username } });
    if (existing) {
      return { success: false, error: 'Username already exists' };
    }

    const passwordHash = await hashPassword(password);
    const user = await userTable.create({
      data: { username, passwordHash, displayName: username, createdAt: Date.now() },
    });

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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}
