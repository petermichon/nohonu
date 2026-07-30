import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import * as sessions from '../core/auth/sessions.ts';
import { json } from '../shared/http.ts';
import { buildCtx, type RouteContext } from './route-context.ts';

export async function requireAuth(req: Request): Promise<Response | undefined> {
  const sessionId = req.headers.get('X-Session-Id');
  if (!sessionId) return undefined;

  const session = await sessions.getSession(sessionId);
  if (!session) return json({ error: 'Invalid session' }, 401);
  await sessions.updateSessionActivity(sessionId);
  return undefined;
}

export function toWebRequest(req: ExpressReq): Request {
  const url = new URL(req.originalUrl, `http://${req.headers.host ?? 'localhost'}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        for (const v of value) headers.append(key, v);
      } else {
        headers.set(key, value);
      }
    }
  }
  const rawBody = (req.method !== 'GET' && req.method !== 'HEAD') ? (req.body as Buffer | undefined) : undefined;
  const body = rawBody ? new Uint8Array(rawBody) : undefined;
  return new Request(url, { method: req.method, headers, body });
}

export async function sendWebResponse(expressRes: ExpressRes, webResponse: Response): Promise<void> {
  webResponse.headers.forEach((value, key) => {
    expressRes.setHeader(key, value);
  });
  const body = await webResponse.arrayBuffer();
  if (body.byteLength > 0) {
    expressRes.status(webResponse.status).send(Buffer.from(body));
  } else {
    expressRes.status(webResponse.status).end();
  }
}

export function wrap(fn: (req: Request) => Response | Promise<Response>): (req: ExpressReq, res: ExpressRes) => Promise<void> {
  return async (req, res) => {
    const webReq = toWebRequest(req);
    const authError = await requireAuth(webReq);
    if (authError) { await sendWebResponse(res, authError); return; }
    try {
      const response = await fn(webReq);
      await sendWebResponse(res, response);
    } catch (err) {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

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

export function wrapStrParam(fn: (req: Request, param: string) => Response | Promise<Response>, paramName: string): (req: ExpressReq, res: ExpressRes) => Promise<void> {
  return async (req, res) => {
    const webReq = toWebRequest(req);
    const authError = await requireAuth(webReq);
    if (authError) { await sendWebResponse(res, authError); return; }
    try {
      const param = (req.params as Record<string, string>)[paramName] ?? '';
      const response = await fn(webReq, param);
      await sendWebResponse(res, response);
    } catch (err) {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
