import type { HealthStatus } from '../../shared/health-status.ts';
import type { StorageStatus } from '../../shared/storage-status.ts';

export function evaluateHealth(storageStatus: StorageStatus): HealthStatus {
  return storageStatus === 'ok' ? 'healthy' : 'degraded';
}
