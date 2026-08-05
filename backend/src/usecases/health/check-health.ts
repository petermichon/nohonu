import { evaluateHealth } from './evaluate-health.ts';
import { probeStorage } from './probe-storage.ts';
import { startedAt } from './started-at.ts';
import type { HealthStatus } from './health-status.ts';

export async function checkHealth(): Promise<{ status: HealthStatus; uptimeMs: number }> {
  const storageStatus = await probeStorage();
  return { status: evaluateHealth(storageStatus), uptimeMs: Date.now() - startedAt };
}
