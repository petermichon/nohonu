import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { uploadProfilePicture as uploadProfilePictureUsecase } from '../../../usecases/auth/upload-profile-picture.ts';

export async function uploadProfilePicture(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  const contentType = req.get('Content-Type') || '';
  const raw = req.body instanceof Buffer ? req.body : Buffer.alloc(0);
  const result = await uploadProfilePictureUsecase(
    sessionId,
    contentType,
    raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength),
  );
  if (!result.success) {
    json(res, { error: result.error }, 400);
    return;
  }
  json(res, { success: true });
}
