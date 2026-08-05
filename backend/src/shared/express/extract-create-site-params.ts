import type { Request as ExpressReq } from 'express';
import type { CreateSiteParams } from '../create-site-params.ts';
import { MAX_ZIP_BYTES } from '../paths.ts';
import { domainFrom } from './domain-from.ts';

export function extractCreateSiteParams(req: ExpressReq): CreateSiteParams | undefined {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const buffer = req.body instanceof Buffer ? req.body : undefined;
  if (!buffer || buffer.length === 0) return;
  if (buffer.length > MAX_ZIP_BYTES) return;

  const subdomain = typeof req.query.subdomain === 'string' ? req.query.subdomain : undefined;
  return { sessionId, domain: domainFrom(req), zipData: new Uint8Array(buffer), subdomain };
}
