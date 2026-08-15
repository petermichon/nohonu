import type { Request as ExpressReq } from 'express';
import type { ToggleStarParams } from '../toggle-star-params.ts';
import { siteIdFrom, usernameFrom } from './domain-from.ts';
import { parseJson } from './http.ts';

export async function extractToggleStarParams(req: ExpressReq): Promise<ToggleStarParams | undefined> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const body = await parseJson<{ starred?: boolean }>(req);
  return { sessionId, siteOwnerUsername: usernameFrom(req), siteId: siteIdFrom(req), starred: body?.starred === true };
}
