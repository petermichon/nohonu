import type { Request as ExpressReq } from 'express';
import type { DisplayNameParams } from '../auth/display-name-params.ts';
import { parseJson, requireSessionId } from './http.ts';

export async function extractDisplayNameParams(req: ExpressReq): Promise<DisplayNameParams | undefined> {
  const sessionId = requireSessionId(req);
  if (!sessionId) return undefined;
  const body = await parseJson<{ displayName?: string }>(req);
  if (!body || typeof body.displayName !== 'string' || !body.displayName || body.displayName.length > 50)
    return undefined;
  return { sessionId, displayName: body.displayName };
}
