import { db } from '../../db.ts';

export async function userExists(username: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { username }, select: { username: true } });
  return user !== null;
}
