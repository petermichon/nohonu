import type { Response as ExpressRes } from 'express';
import { json } from '../shared/express/http.ts';
import type { ErrorCode } from '../shared/errors.ts';

export function toHttpStatus(code: ErrorCode): number {
  switch (code) {
    case 'invalid':
      return 400;
    case 'unauthorized':
      return 401;
    case 'forbidden':
      return 403;
    case 'not_found':
      return 404;
    case 'already_exists':
      return 409;
    case 'internal':
      return 500;
    case 'upstream_failed':
      return 502;
  }
}

export function sendUsecaseError(res: ExpressRes, error: { code: ErrorCode; message: string }): void {
  json(res, { error: error.message }, toHttpStatus(error.code));
}
