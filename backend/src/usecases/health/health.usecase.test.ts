import { describe, expect, it } from 'vitest';
import { checkHealth } from '../../usecases/health/index.ts';

describe('checkHealth', () => {
  it('reports healthy with an uptime', async () => {
    const result = await checkHealth();
    expect(result.status).toBe('healthy');
    expect(result.uptimeMs).toBeGreaterThanOrEqual(0);
  });
});
