import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { siteIdFrom, usernameFrom } from '../../../shared/express/domain-from.ts';
import { getSiteIcon as getSiteIconUsecase } from '../../../usecases/sites/get-site-icon.ts';

export async function getSiteIcon(req: ExpressReq, res: ExpressRes): Promise<void> {
  const siteId = siteIdFrom(req);
  const result = await getSiteIconUsecase(usernameFrom(req), siteId);
  if (!result) {
    res.status(404).end();
    return;
  }

  res.set('Content-Type', result.contentType);
  res.set('Cache-Control', 'public, max-age=300');
  res.send(Buffer.from(result.data.buffer));
}
