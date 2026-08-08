import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../shared/express/http.ts';
import { checkHealth } from '../../usecases/health/check-health.ts';
import { COMMIT_SHA } from '../../config.ts';

export async function health(_req: ExpressReq, res: ExpressRes): Promise<void> {
  const result = await checkHealth();
  json(
    res,
    { status: result.status, uptimeMs: result.uptimeMs, commit: COMMIT_SHA },
    result.status === 'healthy' ? 200 : 503
  );
}
