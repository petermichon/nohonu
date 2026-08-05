import type { Request as ExpressReq } from 'express';
import type { RegisterParams } from '../register-params.ts';
import { parseJson } from './http.ts';

export async function extractRegisterParams(req: ExpressReq): Promise<RegisterParams | undefined> {
  const body = await parseJson<{ password?: string; username?: string }>(req);
  if (!body) return undefined;
  if (!body.password || !body.username) return undefined;
  return { password: body.password, username: body.username, userAgent: req.get('User-Agent') || undefined };
}
