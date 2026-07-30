import { json } from '../../shared/http.ts';
import * as healthUc from '../../usecases/health/index.ts';

export async function health(): Promise<Response> {
  const result = await healthUc.checkHealth();
  return json({ status: result.status, uptimeMs: result.uptimeMs }, result.status === 'healthy' ? 200 : 503);
}
