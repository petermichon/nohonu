import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { requireAuth } from './require-auth.ts';
import { toWebRequest } from './to-web-request.ts';
import { sendWebResponse } from './send-web-response.ts';
import { buildCtx } from './build-ctx.ts';
import type { RouteContext } from './route-context.ts';

export function wrapCtx(fn: (req: Request, ctx: RouteContext) => Response | Promise<Response>): (req: ExpressReq, res: ExpressRes) => Promise<void> {
  return async (req, res) => {
    const webReq = toWebRequest(req);
    const authError = await requireAuth(webReq);
    if (authError) { await sendWebResponse(res, authError); return; }
    try {
      const ctx = buildCtx(req);
      const response = await fn(webReq, ctx);
      await sendWebResponse(res, response);
    } catch (err) {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
