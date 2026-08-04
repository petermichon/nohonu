import { db } from '../../db.ts';

export async function listUsers(): Promise<string[]> {
  const users = await db.user.findMany({ select: { username: true } });
  return users.map((u) => u.username);
}
