import { json, checkMethod } from '../../shared/http.ts';
import * as authUc from '../../usecases/auth/index.ts';

export function auth(req: Request): Response {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return methodError;

  const result = authUc.checkAuth(req.headers.get('X-Api-Key'));
  const status = result.secured && !result.valid ? 401 : 200;
  return json(result, status);
}
