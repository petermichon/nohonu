import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { siteIdFrom, usernameFrom } from '../../../shared/express/domain-from.ts';
import { getSiteVisitors as getSiteVisitorsUsecase } from '../../../usecases/sites/get-site-visitors.ts';

export function getSiteVisitors(req: ExpressReq, res: ExpressRes): void {
  json(res, { siteId: siteIdFrom(req), visitors: getSiteVisitorsUsecase(usernameFrom(req), siteIdFrom(req)) });
}
