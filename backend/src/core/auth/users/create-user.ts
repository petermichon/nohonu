import { db } from '../../../db.ts';
import { hashPassword } from './password.ts';
import type { User } from './user.ts';

export async function createUser(password: string, username: string): Promise<User> {
  const existing = await db.user.findUnique({ where: { username } });
  if (existing) {
    throw new Error('Username already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      username,
      passwordHash,
      displayName: username,
      createdAt: Date.now(),
    },
  });

  return {
    passwordHash: user.passwordHash,
    username: user.username,
    displayName: user.displayName,
    createdAt: user.createdAt,
    profilePicture: user.profilePicture ?? undefined,
  };
}
