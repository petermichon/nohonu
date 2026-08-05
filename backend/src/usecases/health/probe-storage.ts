import { user } from '../../db/user.ts';
import type { StorageStatus } from '../../shared/storage-status.ts';

export async function probeStorage(): Promise<StorageStatus> {
  try {
    await user.count();
    return 'ok';
  } catch {
    return 'error';
  }
}
