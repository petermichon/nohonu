import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { createSite } from '../../../usecases/sites/create-site.ts';
import { extractCreateSiteParams } from '../../../shared/express/extract-create-site-params.ts';

export async function createSiteRaw(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = extractCreateSiteParams(req);
  if (!params) {
    json(res, { error: 'Missing zip file' }, 400);
    return;
  }

  const result = await createSite(params.sessionId, params.siteId, params.zipData, params.subdomain);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { success: true, siteId: params.siteId, index: result.value.index }, 201);
}
