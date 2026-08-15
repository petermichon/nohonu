import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { extractRegisterParams } from '../../../shared/express/extract-register-params.ts';
import { registerResponse } from '../../../shared/express/register-response.ts';
import { register } from '../../../usecases/auth/register.ts';

export async function authRegister(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractRegisterParams(req);
  if (!params) {
    json(res, { error: 'Invalid username or password' }, 400);
    return;
  }
  const result = await register(params.password, params.username, params.userAgent);
  registerResponse(res, result);
}
