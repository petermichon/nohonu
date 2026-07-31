import { db } from '../../../db.ts';

export async function deleteSession(id: string): Promise<void> {
  await db.session.deleteMany({ where: { id } });
}
