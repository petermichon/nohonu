import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { extractDisplayNameParams } from '../../../shared/express/extract-display-name-params.ts';
import { updateDisplayName } from '../../../usecases/auth/update-display-name.ts';

export async function authDisplayName(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractDisplayNameParams(req);
  if (!params) {
    json(res, { error: 'Display name required' }, 400);
    return;
  }
  const result = await updateDisplayName(params.sessionId, params.displayName);
  if (!result.success) {
    json(res, { error: result.error || 'Failed to update display name' }, 401);
    return;
  }
  json(res, { success: true }, 200);
}
