import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { extractToggleStarParams } from '../../../shared/express/extract-toggle-star-params.ts';
import { toggleStar as toggleStarUsecase } from '../../../usecases/sites/toggle-star.ts';

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
