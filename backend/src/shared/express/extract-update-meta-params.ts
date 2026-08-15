import type { Request as ExpressReq } from 'express';
import type { UpdateMetaParams } from '../update-meta-params.ts';
import { siteIdFrom } from './domain-from.ts';
import { parseJson } from './http.ts';

export async function extractUpdateMetaParams(req: ExpressReq): Promise<UpdateMetaParams | undefined> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const body = await parseJson<{ subdomain?: string; displayName?: string }>(req);
  if (!body) return;

  return { sessionId, siteId: siteIdFrom(req), meta: body };
}
