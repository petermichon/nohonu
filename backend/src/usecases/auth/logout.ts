import { db } from '../../db.ts';

export async function logout(sessionId: string): Promise<void> {
  await db.session.deleteMany({ where: { id: sessionId } });
}
