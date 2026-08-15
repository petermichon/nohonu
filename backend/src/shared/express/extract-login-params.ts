import type { Request as ExpressReq } from 'express';
import type { LoginParams } from '../login-params.ts';
import { parseJson } from './http.ts';

export async function extractLoginParams(req: ExpressReq): Promise<LoginParams | undefined> {
  const body = await parseJson<{ username?: string; password?: string }>(req);
  if (!body) return undefined;
  if (!body.username || !body.password) return undefined;
  return { username: body.username.toLowerCase(), password: body.password, userAgent: req.get('User-Agent') || undefined };
}
