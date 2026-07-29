import type { Request as ExpressReq } from 'express';

export type RouteContext = {
  domain: string;
  action?: string;
  subAction?: string;
  customDomain?: string;
  timestamp?: number;
  url: URL;
};

export function buildCtx(req: ExpressReq): RouteContext {
  const p = req.params as Record<string, string | undefined>;
  const domain = p['domain'] ?? '';
  const action = p['action'];
  const subAction = p['subAction'];
  const timestamp = p['timestamp'] ? parseInt(p['timestamp'], 10) : undefined;
  return {
    domain,
    action,
    subAction,
    customDomain: action === 'custom-domains' ? subAction : undefined,
    timestamp,
    url: new URL(req.originalUrl, `http://${req.headers.host ?? 'localhost'}`),
  };
}
