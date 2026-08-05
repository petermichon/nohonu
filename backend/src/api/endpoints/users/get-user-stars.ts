import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { userNotFound } from '../../../shared/express/user-not-found.ts';
import { listStarredSites } from '../../../usecases/sites/list-starred-sites.ts';

export async function getUserStars(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = (req.params as Record<string, string>)['username'];
  if (!username) {
    userNotFound(res);
    return;
  }

  const starredSites = await listStarredSites(username);
  json(res, { sites: starredSites });
}
