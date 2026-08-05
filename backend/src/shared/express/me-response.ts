import type { Response as ExpressRes } from 'express';
import type { MeResult } from '../me-result.ts';
import { json } from './http.ts';

export function meResponse(res: ExpressRes, result: MeResult): void {
  if (result.error || !result.user) {
    json(res, { error: result.error || 'User not found' }, 401);
    return;
  }
  json(
    res,
    {
      user: {
        username: result.user.username,
        displayName: result.user.displayName,
        profilePicture: result.user.profilePicture,
      },
      session: result.session,
    },
    200,
  );
}
