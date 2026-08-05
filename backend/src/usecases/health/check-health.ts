import { user } from '../../db/user.ts';
import { STARTED_AT } from '../../config.ts';
import { evaluateHealth } from '../../shared/health/evaluate-health.ts';
import type { HealthStatus } from '../../shared/health/health-status.ts';
import type { StorageStatus } from '../../shared/health/storage-status.ts';

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
