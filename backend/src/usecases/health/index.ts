import * as storage from '../../core/health/storage.ts';

const startedAt = Date.now();

export type StorageStatus = 'ok' | 'error';
export type HealthStatus = 'healthy' | 'degraded';

export function evaluateHealth(storageStatus: StorageStatus): HealthStatus {
  return storageStatus === 'ok' ? 'healthy' : 'degraded';
}

export async function checkHealth(): Promise<{ status: HealthStatus; uptimeMs: number }> {
  const storageStatus = await storage.probeStorage();
  return { status: evaluateHealth(storageStatus), uptimeMs: Date.now() - startedAt };
}
