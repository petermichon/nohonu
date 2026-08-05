import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { createSiteFromGithub } from './create-site-from-github.ts';
import { createSiteRaw } from './create-site-raw.ts';

export async function createSiteDispatch(req: ExpressReq, res: ExpressRes): Promise<void> {
  const contentType = req.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    await createSiteFromGithub(req, res);
  } else {
    await createSiteRaw(req, res);
  }
}
