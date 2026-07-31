import { db } from '../../../db.ts';

export async function updateDisplayName(username: string, displayName: string): Promise<void> {
  await db.user.update({ where: { username }, data: { displayName } });
}
