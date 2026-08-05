import type { Request as ExpressReq } from 'express';
import { parseJson } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { validateRepo } from '../../../shared/validate-repo.ts';
import type { CreateGithubParams } from '../../../shared/create-github-params.ts';

export async function extractCreateGithubParams(req: ExpressReq): Promise<CreateGithubParams | undefined> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const body = await parseJson<{ repo?: unknown; branch?: unknown; subdomain?: unknown }>(req);
  if (!body || !validateRepo(body.repo)) return;

  const subdomain = typeof body.subdomain === 'string' ? body.subdomain : undefined;
  return {
    sessionId,
    domain: domainFrom(req),
    repo: body.repo,
    ref: typeof body.branch === 'string' && body.branch.length > 0 ? body.branch : 'main',
    subdomain,
  };
}
