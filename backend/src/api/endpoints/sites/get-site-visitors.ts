import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { getSiteVisitors as getSiteVisitorsUsecase } from '../../../usecases/sites/get-site-visitors.ts';

export function getSiteVisitors(req: ExpressReq, res: ExpressRes): void {
  json(res, { domain: domainFrom(req), visitors: getSiteVisitorsUsecase(domainFrom(req)) });
}
