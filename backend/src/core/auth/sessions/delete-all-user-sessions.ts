import { db } from '../../../db.ts';

export async function deleteAllUserSessions(username: string): Promise<void> {
  await db.session.deleteMany({ where: { username } });
}
