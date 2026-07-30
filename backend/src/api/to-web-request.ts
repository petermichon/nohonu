import type { Request as ExpressReq } from 'express';

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
