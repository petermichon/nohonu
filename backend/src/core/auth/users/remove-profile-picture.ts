import { db } from '../../../db.ts';

export async function removeProfilePicture(username: string): Promise<void> {
  await db.user.update({ where: { username }, data: { profilePicture: null } });
}
