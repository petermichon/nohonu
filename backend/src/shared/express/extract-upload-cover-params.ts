import type { Request as ExpressReq } from 'express';
import type { UploadCoverParams } from '../sites/upload-cover-params.ts';
import { domainFrom } from './domain-from.ts';

export function extractUploadCoverParams(req: ExpressReq): UploadCoverParams | undefined {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const contentType = req.get('Content-Type') || '';
  if (!contentType.startsWith('image/')) return;

  const buffer = req.body instanceof Buffer ? req.body : undefined;
  if (!buffer || buffer.byteLength > 5_242_880) return;

  return { sessionId, domain: domainFrom(req), data: new Uint8Array(buffer) };
}
