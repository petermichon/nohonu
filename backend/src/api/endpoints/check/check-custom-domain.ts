import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { checkCustomDomain as checkCustomDomainUsecase } from '../../../usecases/sites/check-custom-domain.ts';

export async function checkCustomDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const domain = req.query.domain as string;
  if (!domain) {
    res.status(400).json({ error: 'domain query parameter is required' });
    return;
  }

  const exists = await checkCustomDomainUsecase(domain);
  res.status(exists ? 200 : 404).json(exists ? 'OK' : { error: 'Domain not found' });
}
