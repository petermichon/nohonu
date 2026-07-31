import { db } from '../../../db.ts';
import { verifyPassword } from './password.ts';
import type { User } from './user.ts';

export async function validateUser(username: string, password: string): Promise<User | null> {
  const user = await db.user.findUnique({ where: { username } });
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  return valid
    ? {
        passwordHash: user.passwordHash,
        username: user.username,
        displayName: user.displayName,
        createdAt: user.createdAt,
        profilePicture: user.profilePicture ?? undefined,
      }
    : null;
}
