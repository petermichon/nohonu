import { beforeEach, describe, expect, it } from 'vitest';
import { health, resetTestState } from '../../test/setup.ts';

beforeEach(async () => {
  await resetTestState();
});

describe('evaluateHealth', () => {
  it('maps ok to healthy', () => {
    expect(health.evaluateHealth('ok')).toBe('healthy');
  });

  it('maps error to degraded', () => {
    expect(health.evaluateHealth('error')).toBe('degraded');
  });
});

describe('checkHealth', () => {
  it('reports healthy with an uptime', async () => {
    const result = await health.checkHealth();
    expect(result.status).toBe('healthy');
    expect(result.uptimeMs).toBeGreaterThanOrEqual(0);
  });
});
