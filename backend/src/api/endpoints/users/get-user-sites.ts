import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { userNotFound } from '../../../shared/express/user-not-found.ts';
import { listSites } from '../../../usecases/sites/list-sites.ts';

export async function getUserSites(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = (req.params as Record<string, string>)['username'];
  if (!username) {
    userNotFound(res);
    return;
  }

  const siteList = await listSites(username);
  json(res, { sites: siteList });
}
