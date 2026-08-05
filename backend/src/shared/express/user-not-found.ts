import type { Response as ExpressRes } from 'express';
import { json } from './http.ts';

export function userNotFound(res: ExpressRes): void {
  json(res, { error: 'User not found' }, 404);
}
