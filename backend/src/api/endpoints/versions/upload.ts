import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { extractUploadParams } from '../../../shared/express/extract-upload-params.ts';
import { uploadVersion } from '../../../usecases/sites/upload-version.ts';

export async function upload(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = extractUploadParams(req);
  if (!params) {
    json(res, { error: 'Missing zip file' }, 400);
    return;
  }

  const result = await uploadVersion(params.sessionId, params.siteId, params.zipData);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { success: true, siteId: params.siteId, index: result.value.index });
}
