import type { Request, Response, NextFunction } from 'express';
import { SERVER_PASSWORD } from '../config.ts';

export function requireServerPassword(req: Request, res: Response, next: NextFunction): void {
  if (req.headers['x-server-password'] === SERVER_PASSWORD) return next();
  res.status(401).json({ error: 'Unauthorized' });
}
