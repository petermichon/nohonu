import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { listAllSites } from '../../../usecases/sites/list-all-sites.ts';

export async function listExploreSites(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = req.get('X-Username') || undefined;
  json(res, { sites: await listAllSites(username) });
}
