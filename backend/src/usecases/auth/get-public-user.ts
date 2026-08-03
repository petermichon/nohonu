import { db } from '../../db.ts';
import { toAuthUser } from '../../shared/auth-user.ts';
import type { AuthUser } from './types.ts';

export async function getPublicUser(username: string): Promise<AuthUser | null> {
  const user = await db.user.findUnique({ where: { username } });
  return user ? toAuthUser(user) : null;
}
