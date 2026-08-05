import type { Response as ExpressRes } from 'express';
import type { RegisterResult } from '../auth/register-result.ts';
import { json } from './http.ts';

export function registerResponse(res: ExpressRes, result: RegisterResult): void {
  if (!result.success || !result.user) {
    json(res, { error: result.error || 'Registration failed' }, 400);
    return;
  }
  json(
    res,
    {
      user: { username: result.user.username, displayName: result.user.displayName },
      session: result.session,
    },
    201,
  );
}
