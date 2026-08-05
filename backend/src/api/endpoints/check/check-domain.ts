import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { checkDomain as domainExists } from '../../../usecases/sites/check-domain.ts';

export async function checkDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const rawDomain = (req.query.domain as string) || '';
  const user = (req.query.user as string) || '';

  const exists = await domainExists(user, rawDomain);
  res.status(exists ? 200 : 404).end();
}
