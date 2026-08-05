import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, parseJson } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { toggleStar as toggleStarUsecase } from '../../../usecases/sites/toggle-star.ts';

type ToggleStarParams = { sessionId: string; domain: string; starred: boolean };

async function extractToggleStarParams(req: ExpressReq): Promise<ToggleStarParams | undefined> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const body = await parseJson<{ starred?: boolean }>(req);
  return { sessionId, domain: domainFrom(req), starred: body?.starred === true };
}

export async function toggleStar(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractToggleStarParams(req);
  if (!params) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const result = await toggleStarUsecase(params.sessionId, params.domain, params.starred);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { domain: params.domain, starred: result.value.starred, starCount: result.value.starCount });
}
