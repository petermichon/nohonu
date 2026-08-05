import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { checkSubdomain as subdomainExists } from '../../../usecases/sites/check-subdomain.ts';

export async function checkSubdomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const subdomain = req.query.subdomain as string;
  if (!subdomain) {
    res.status(400).json({ error: 'subdomain query parameter is required' });
    return;
  }

  const exists = await subdomainExists(subdomain);
  res.status(exists ? 200 : 404).end();
}
