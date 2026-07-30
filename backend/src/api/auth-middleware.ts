import type { Request, Response, NextFunction } from 'express';
import * as sessions from '../core/auth/sessions.ts';

declare global {
  namespace Express {
    interface Request {
      user?: string;
    }
  }
}

export async function requireSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.get('X-Session-Id');
  if (!sessionId) { res.status(401).json({ error: 'Session required' }); return; }

  const session = await sessions.getSession(sessionId);
  if (!session) { res.status(401).json({ error: 'Invalid session' }); return; }

  req.user = session.username;
  next();
}
