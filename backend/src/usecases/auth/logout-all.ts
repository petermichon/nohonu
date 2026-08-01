import { db } from '../../db.ts';

export async function logoutAll(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { username: userId } });
}
