import type { Request as ExpressReq } from 'express';
import type { UploadParams } from '../sites/upload-params.ts';
import { MAX_ZIP_BYTES } from '../paths.ts';
import { domainFrom } from './domain-from.ts';

export function extractUploadParams(req: ExpressReq): UploadParams | undefined {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const buffer = req.body instanceof Buffer ? req.body : undefined;
  if (!buffer || buffer.length === 0) return;
  if (buffer.length > MAX_ZIP_BYTES) return;

  return { sessionId, domain: domainFrom(req), zipData: new Uint8Array(buffer) };
}
