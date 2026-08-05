import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../shared/express/http.ts';
import { checkHealth } from '../../usecases/health/check-health.ts';

export async function health(_req: ExpressReq, res: ExpressRes): Promise<void> {
  const result = await checkHealth();
  json(res, { status: result.status, uptimeMs: result.uptimeMs }, result.status === 'healthy' ? 200 : 503);
}
