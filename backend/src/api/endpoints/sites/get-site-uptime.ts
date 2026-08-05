import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { getSiteUptime as getSiteUptimeUsecase } from '../../../usecases/sites/get-site-uptime.ts';

export function getSiteUptime(req: ExpressReq, res: ExpressRes): void {
  const slots = Math.min(parseInt(req.query.slots as string) || 60, 10080);
  const group = Math.min(parseInt(req.query.group as string) || 1, 60);
  json(res, { domain: domainFrom(req), uptime: getSiteUptimeUsecase(domainFrom(req), slots, group) });
}
