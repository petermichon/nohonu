export type ErrorCode =
  | 'invalid'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'already_exists'
  | 'internal'
  | 'upstream_failed';

export type Result<T> = { ok: true; value: T } | { ok: false; code: ErrorCode; message: string };
