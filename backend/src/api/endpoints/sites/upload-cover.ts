import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { uploadSiteCover } from '../../../usecases/sites/upload-site-cover.ts';

type UploadCoverParams = { sessionId: string; domain: string; data: Uint8Array };

function extractUploadCoverParams(req: ExpressReq): UploadCoverParams | undefined {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const contentType = req.get('Content-Type') || '';
  if (!contentType.startsWith('image/')) return;

  const buffer = req.body instanceof Buffer ? req.body : undefined;
  if (!buffer || buffer.byteLength > 5_242_880) return;

  return { sessionId, domain: domainFrom(req), data: new Uint8Array(buffer) };
}

export async function uploadCover(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = extractUploadCoverParams(req);
  if (!params) {
    json(res, { error: 'Invalid image' }, 400);
    return;
  }

  const result = await uploadSiteCover(params.sessionId, params.domain, params.data);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { success: true });
}
