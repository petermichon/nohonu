import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { extractLoginParams } from '../../../shared/express/extract-login-params.ts';
import { loginResponse } from '../../../shared/express/login-response.ts';
import { login } from '../../../usecases/auth/login.ts';

export async function authLogin(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractLoginParams(req);
  if (!params) {
    json(res, { error: 'Username and password are required' }, 400);
    return;
  }
  const result = await login(params.username, params.password, params.userAgent);
  loginResponse(res, result);
}
