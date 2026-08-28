import type { Request as ExpressReq } from 'express';
import type { DeleteAccountParams } from '../delete-account-params.ts';
import { parseJson, requireSessionId } from './http.ts';

export async function extractDeleteAccountParams(
  req: ExpressReq
): Promise<DeleteAccountParams | undefined> {
  const sessionId = requireSessionId(req);
  if (!sessionId) return undefined;
  const body = await parseJson<{ password?: string }>(req);
  if (!body || typeof body.password !== 'string' || !body.password) return undefined;
  return { sessionId, password: body.password };
}