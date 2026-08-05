import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { getAllCustomDomains as getAllCustomDomainsUsecase } from '../../../usecases/sites/get-all-custom-domains.ts';

export async function getAllCustomDomains(req: ExpressReq, res: ExpressRes): Promise<void> {
  try {
    const account = req.get('X-Account') || undefined;
    const allCustomDomains = await getAllCustomDomainsUsecase(account);
    json(res, { customDomains: allCustomDomains });
  } catch (err) {
    json(res, { error: err instanceof Error ? err.message : 'Failed to get custom domains' }, 500);
  }
}
