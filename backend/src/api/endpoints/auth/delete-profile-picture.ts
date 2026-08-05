import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { deleteProfilePicture as deleteProfilePictureUsecase } from '../../../usecases/auth/delete-profile-picture.ts';

export async function deleteProfilePicture(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  const result = await deleteProfilePictureUsecase(sessionId);
  if (!result.success) {
    json(res, { error: result.error }, 500);
    return;
  }
  json(res, { success: true });
}
