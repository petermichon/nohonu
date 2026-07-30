import type { Response as ExpressRes } from 'express';

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
