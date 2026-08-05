import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { resolveDomainAndServe } from '../../../usecases/sites/resolve-domain-and-serve.ts';
import { serveSiteFile } from '../../../usecases/sites/serve-site-file.ts';
import { recordPageHit } from '../../../usecases/sites/record-page-hit.ts';

export async function serveStatic(req: ExpressReq, res: ExpressRes): Promise<void> {
  const host = req.get('Host') ?? '';
  const resolved = await resolveDomainAndServe(host, req.path);
  if (!resolved) {
    res.status(404).end();
    return;
  }

  const result = await serveSiteFile(resolved.user, resolved.domain, resolved.filePath);
  if (!result) {
    res.status(404).end();
    return;
  }

  if (result.contentType === 'text/html') {
    recordPageHit(resolved.domain, req.ip || 'unknown');
  }

  res.set('Content-Type', result.contentType);
  res.send(Buffer.from(result.data));
}
