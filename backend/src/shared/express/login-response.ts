import type { Response as ExpressRes } from 'express';
import type { LoginResult } from '../auth/login-result.ts';
import { json } from './http.ts';

export function loginResponse(res: ExpressRes, result: LoginResult): void {
  if (!result.success || !result.user) {
    json(res, { error: result.error || 'Login failed' }, 401);
    return;
  }
  json(
    res,
    {
      user: { username: result.user.username, displayName: result.user.displayName },
      session: result.session,
    },
    200,
  );
}
