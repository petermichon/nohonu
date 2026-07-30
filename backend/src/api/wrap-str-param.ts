import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { runPipeline } from './wrap.ts';

export function wrapStrParam(fn: (req: Request, param: string) => Response | Promise<Response>, paramName: string): (req: ExpressReq, res: ExpressRes) => Promise<void> {
  return (req, res) => {
    const param = (req.params as Record<string, string>)[paramName] ?? '';
    return runPipeline(req, res, (webReq) => fn(webReq, param));
  };
}
