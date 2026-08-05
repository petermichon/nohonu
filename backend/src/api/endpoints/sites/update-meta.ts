import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { extractUpdateMetaParams } from '../../../shared/express/extract-update-meta-params.ts';
import { updateSiteMeta } from '../../../usecases/sites/update-site-meta.ts';

export async function updateMeta(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractUpdateMetaParams(req);
  if (!params) {
    json(res, { error: 'Missing username or body' }, 400);
    return;
  }

  const result = await updateSiteMeta(params.sessionId, params.domain, params.meta);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { domain: params.domain, subdomain: params.meta.subdomain, displayName: params.meta.displayName });
}
