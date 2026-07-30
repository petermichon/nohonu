import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { requireAuth } from './require-auth.ts';
import { toWebRequest } from './to-web-request.ts';
import { sendWebResponse } from './send-web-response.ts';

async function runPipeline(req: ExpressReq, res: ExpressRes, handler: (webReq: Request) => Response | Promise<Response>): Promise<void> {
  const webReq = toWebRequest(req);
  const authError = await requireAuth(webReq);
  if (authError) { await sendWebResponse(res, authError); return; }
  try {
    const response = await handler(webReq);
    await sendWebResponse(res, response);
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function wrap(fn: (req: Request) => Response | Promise<Response>): (req: ExpressReq, res: ExpressRes) => Promise<void> {
  return (req, res) => runPipeline(req, res, (webReq) => fn(webReq));
}

export { runPipeline };
