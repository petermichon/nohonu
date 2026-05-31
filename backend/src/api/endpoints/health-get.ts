import { json } from '../../shared/http.ts';
import * as healthUc from '../../usecases/health/index.ts';

export async function health(): Promise<Response> {
  const result = await healthUc.checkHealth();
  const httpStatus = result.status === 'healthy' ? 200 : 503;
  return json({ status: result.status, uptimeMs: result.uptimeMs }, httpStatus);
}
