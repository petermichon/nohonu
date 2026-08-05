import type { Request, Response, NextFunction } from 'express';
import { API_KEY } from '../config.ts';

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  if (req.headers['x-api-key'] === API_KEY) return next();
  res.status(401).json({ error: 'Unauthorized' });
}
