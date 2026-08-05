import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { getProfilePictureFile } from '../../../usecases/auth/get-profile-picture-file.ts';

export async function getProfilePicture(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = (req.params as Record<string, string>)['username'] || '';
  const file = await getProfilePictureFile(username);
  if (!file) {
    res.status(404).end();
    return;
  }

  res.set('Content-Type', 'image/jpeg');
  res.send(Buffer.from(file));
}
