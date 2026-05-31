import * as storage from '../../core/health/storage.ts';

const startedAt = Date.now();

export async function checkHealth(): Promise<{ status: 'healthy' | 'degraded'; uptimeMs: number }> {
  const storageStatus = await storage.probeStorage();
  const status = storageStatus === 'ok' ? 'healthy' : 'degraded';
  const uptimeMs = Date.now() - startedAt;
  return { status, uptimeMs };
}
