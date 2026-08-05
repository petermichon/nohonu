import { user } from '../../db/user.ts';
import { STARTED_AT } from '../../config.ts';
import { evaluateHealth } from '../../shared/evaluate-health.ts';
import type { HealthStatus } from '../../shared/health-status.ts';
import type { StorageStatus } from '../../shared/storage-status.ts';

export async function checkHealth(): Promise<{ status: HealthStatus; uptimeMs: number }> {
  let storageStatus: StorageStatus;
  try {
    await user.count();
    storageStatus = 'ok';
  } catch {
    storageStatus = 'error';
  }
  return { status: evaluateHealth(storageStatus), uptimeMs: Date.now() - STARTED_AT };
}
