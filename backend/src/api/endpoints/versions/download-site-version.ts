import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { indexFrom } from '../../../shared/express/index-from.ts';
import { downloadVersion } from '../../../usecases/sites/download-version.ts';

export async function downloadSiteVersion(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const idx = indexFrom(req);
  if (idx === undefined) {
    json(res, { error: 'Version timestamp required' }, 400);
    return;
  }

  const result = await downloadVersion(sessionId, domainFrom(req), idx);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  const value = result.value;
  if (!value) {
    json(res, { error: 'Version not found' }, 404);
    return;
  }

  res.set('Content-Type', 'application/zip');
  res.set('Content-Disposition', `attachment; filename="${value.filename}"`);
  res.send(Buffer.from(value.data));
}
