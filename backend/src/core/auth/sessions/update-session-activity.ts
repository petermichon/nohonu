import { db } from '../../../db.ts';

export async function updateSessionActivity(id: string): Promise<void> {
  await db.session.updateMany({ where: { id }, data: { lastActive: Date.now() } });
}
