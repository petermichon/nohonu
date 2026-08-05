import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { downloadActiveVersion } from '../../../usecases/sites/download-active-version.ts';

export async function downloadSite(req: ExpressReq, res: ExpressRes): Promise<void> {
  const domain = domainFrom(req);
  const result = await downloadActiveVersion(domain);
  if (!result) {
    json(res, { error: 'Site not found' }, 404);
    return;
  }

  res.set('Content-Type', 'application/zip');
  res.set('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(Buffer.from(result.data));
}
