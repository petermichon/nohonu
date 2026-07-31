import { db } from '../../../db.ts';

export async function setProfilePicture(username: string): Promise<void> {
  await db.user.update({ where: { username }, data: { profilePicture: 'profile.jpg' } });
}
