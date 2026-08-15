import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { extractUploadCoverParams } from '../../../shared/express/extract-upload-cover-params.ts';
import { uploadSiteCover } from '../../../usecases/sites/upload-site-cover.ts';

export async function uploadCover(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = extractUploadCoverParams(req);
  if (!params) {
    json(res, { error: 'Invalid image' }, 400);
    return;
  }

  const result = await uploadSiteCover(params.sessionId, params.siteId, params.data);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { success: true });
}
