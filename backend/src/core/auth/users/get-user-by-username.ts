import { db } from '../../../db.ts';
import type { User } from './user.ts';

export async function getUserByUsername(username: string): Promise<User | null> {
  const user = await db.user.findUnique({ where: { username } });
  if (!user) return null;
  return {
    passwordHash: user.passwordHash,
    username: user.username,
    displayName: user.displayName,
    createdAt: user.createdAt,
    profilePicture: user.profilePicture ?? undefined,
  };
}
