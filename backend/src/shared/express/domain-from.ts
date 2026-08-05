import type { Request as ExpressReq } from 'express';

export function domainFrom(req: ExpressReq): string {
  return (req.params as Record<string, string>)['domain'] || '';
}
