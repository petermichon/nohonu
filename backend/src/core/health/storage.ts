import { db } from '../../db.ts';

export async function probeStorage(): Promise<'ok' | 'error'> {
  try {
    await db.user.count();
    return 'ok';
  } catch {
    return 'error';
  }
}
