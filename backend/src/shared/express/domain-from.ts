import type { Request as ExpressReq } from 'express';

export function siteIdFrom(req: ExpressReq): string {
  return (req.params as Record<string, string>)['siteId'] || '';
}

export function usernameFrom(req: ExpressReq): string {
  return (req.params as Record<string, string>)['username'] || '';
}
