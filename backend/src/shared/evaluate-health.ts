import type { HealthStatus } from './health-status.ts';
import type { StorageStatus } from './storage-status.ts';

export function evaluateHealth(storageStatus: StorageStatus): HealthStatus {
  return storageStatus === 'ok' ? 'healthy' : 'degraded';
}
