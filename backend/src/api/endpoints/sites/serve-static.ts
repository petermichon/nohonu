import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { serveRequest } from '../../../usecases/sites/serve-request.ts';

export async function serveStatic(req: ExpressReq, res: ExpressRes): Promise<void> {
  const host = req.get('Host') ?? '';
  const result = await serveRequest(host, req.path, req.ip || 'unknown');
  if (!result) {
    res.status(404).end();
    return;
  }

  res.set('Content-Type', result.contentType);
  res.send(Buffer.from(result.data));
}
