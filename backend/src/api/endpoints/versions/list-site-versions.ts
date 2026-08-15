import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { siteIdFrom, usernameFrom } from '../../../shared/express/domain-from.ts';
import { listVersions } from '../../../usecases/sites/list-versions.ts';

export async function listSiteVersions(req: ExpressReq, res: ExpressRes): Promise<void> {
  const siteId = siteIdFrom(req);
  const result = await listVersions(usernameFrom(req), siteId);
  if (!result) {
    json(res, { siteId, versions: [], current: null });
    return;
  }
  json(res, { siteId, versions: result.versions, current: result.current });
}
