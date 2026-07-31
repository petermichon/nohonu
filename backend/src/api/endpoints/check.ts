import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import * as sites from '../../usecases/sites/index.ts';
import { getCustomDomainCache } from '../../usecases/sites/index.ts';

export async function checkDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const rawDomain = (req.query.domain as string) || '';
  const user = (req.query.user as string) || '';

  const exists = await sites.checkDomain(user, rawDomain);
  res.status(exists ? 200 : 404).end();
}

export async function checkCustomDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const domain = req.query.domain as string;
  if (!domain) {
    res.status(400).json({ error: 'domain query parameter is required' });
    return;
  }

  const cache = await getCustomDomainCache();
  if (cache.get(domain)) {
    res.status(200).send('OK');
    return;
  }
  res.status(404).json({ error: 'Domain not found' });
}

export async function checkSubdomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const subdomain = req.query.subdomain as string;
  if (!subdomain) {
    res.status(400).json({ error: 'subdomain query parameter is required' });
    return;
  }

  const exists = await sites.checkSubdomain(subdomain);
  res.status(exists ? 200 : 404).end();
}
