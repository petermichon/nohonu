import { user as userTable } from '../../db/user.ts';
import { toAuthUser } from '../../shared/auth/auth-user.ts';

import type { AuthUser } from '../../shared/auth/auth-user.ts';

export async function getPublicUser(username: string): Promise<AuthUser | null> {
  const user = await userTable.findUnique({ where: { username } });
  return user ? toAuthUser(user) : null;
}
