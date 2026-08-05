import { session } from '../../db/session.ts';

export async function logout(sessionId: string): Promise<void> {
  await session.deleteMany({ where: { id: sessionId } });
}
