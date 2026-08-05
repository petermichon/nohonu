import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { getSiteCover as getSiteCoverUsecase } from '../../../usecases/sites/get-site-cover.ts';

export async function getSiteCover(req: ExpressReq, res: ExpressRes): Promise<void> {
  const domain = domainFrom(req);
  const result = await getSiteCoverUsecase(domain);
  if (!result) {
    res.status(404).end();
    return;
  }

  res.set('Content-Type', 'image/jpeg');
  res.set('Cache-Control', 'public, max-age=300');
  res.send(Buffer.from(result.buffer));
}
