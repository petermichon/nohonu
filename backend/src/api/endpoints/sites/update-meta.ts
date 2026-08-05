import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, parseJson } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { updateSiteMeta } from '../../../usecases/sites/update-site-meta.ts';

type UpdateMetaParams = { sessionId: string; domain: string; meta: { subdomain?: string; displayName?: string } };

async function extractUpdateMetaParams(req: ExpressReq): Promise<UpdateMetaParams | undefined> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const body = await parseJson<{ subdomain?: string; displayName?: string }>(req);
  if (!body) return;

  return { sessionId, domain: domainFrom(req), meta: body };
}

export async function updateMeta(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractUpdateMetaParams(req);
  if (!params) {
    json(res, { error: 'Missing username or body' }, 400);
    return;
  }

  const result = await updateSiteMeta(params.sessionId, params.domain, params.meta);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { domain: params.domain, subdomain: params.meta.subdomain, displayName: params.meta.displayName });
}
