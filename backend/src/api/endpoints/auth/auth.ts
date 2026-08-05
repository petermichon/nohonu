import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { checkAuth } from '../../../usecases/apikey/check-auth.ts';

export function auth(req: ExpressReq, res: ExpressRes): void {
  const key = req.get('X-Api-Key') || null;
  const result = checkAuth(key);
  json(res, result, result.secured && !result.valid ? 401 : 200);
}
