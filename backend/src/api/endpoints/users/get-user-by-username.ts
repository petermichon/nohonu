import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { userNotFound } from '../../../shared/express/user-not-found.ts';
import { getPublicUser } from '../../../usecases/auth/get-public-user.ts';

export async function getUserByUsernameEndpoint(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = (req.params as Record<string, string>)['username'];
  if (!username) {
    json(res, { error: 'Username required' }, 400);
    return;
  }

  const user = await getPublicUser(username);
  if (!user) {
    userNotFound(res);
    return;
  }
  json(res, { user }, 200);
}
