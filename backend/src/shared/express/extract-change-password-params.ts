import type { Request as ExpressReq } from 'express';
import type { ChangePasswordParams } from '../change-password-params.ts';
import { parseJson, requireSessionId } from './http.ts';

export async function extractChangePasswordParams(
  req: ExpressReq
): Promise<ChangePasswordParams | undefined> {
  const sessionId = requireSessionId(req);
  if (!sessionId) return undefined;
  const body = await parseJson<{ currentPassword?: string; newPassword?: string }>(req);
  if (!body || typeof body.currentPassword !== 'string' || !body.currentPassword) return undefined;
  if (typeof body.newPassword !== 'string' || body.newPassword.length < 8) return undefined;
  return { sessionId, currentPassword: body.currentPassword, newPassword: body.newPassword };
}
