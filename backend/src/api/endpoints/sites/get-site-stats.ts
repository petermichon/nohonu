import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { getSiteStats as getSiteStatsUsecase } from '../../../usecases/sites/get-site-stats.ts';

export function getSiteStats(req: ExpressReq, res: ExpressRes): void {
  const slots = Math.min(parseInt(req.query.slots as string) || 60, 10080);
  const group = Math.min(parseInt(req.query.group as string) || 1, 60);
  const stats = getSiteStatsUsecase(domainFrom(req), slots, group);
  json(res, { domain: domainFrom(req), stats });
}
