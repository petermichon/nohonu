import type { Request as ExpressReq } from 'express';
import { p } from './http.ts';

export function indexFrom(req: ExpressReq): number | undefined {
  const val = p(req, 'timestamp');
  if (!val || isNaN(Number(val))) return undefined;
  return Number(val);
}
