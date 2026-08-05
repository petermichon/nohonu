import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { listVersions } from '../../../usecases/sites/list-versions.ts';

export async function listSiteVersions(req: ExpressReq, res: ExpressRes): Promise<void> {
  const domain = domainFrom(req);
  const result = await listVersions(domain);
  if (!result) {
    json(res, { domain, versions: [], current: null });
    return;
  }
  json(res, { domain, versions: result.versions, current: result.current });
}
