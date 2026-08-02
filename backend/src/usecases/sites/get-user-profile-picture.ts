import { db } from '../../db.ts';

export async function getUserProfilePicture(username: string): Promise<string | undefined> {
  const user = await db.user.findUnique({ where: { username }, select: { profilePicture: true } });
  return user?.profilePicture ?? undefined;
}
