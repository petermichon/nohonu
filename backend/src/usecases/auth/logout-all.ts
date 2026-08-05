import { session } from '../../db/session.ts';

export async function logoutAll(userId: string): Promise<void> {
  await session.deleteMany({ where: { username: userId } });
}
