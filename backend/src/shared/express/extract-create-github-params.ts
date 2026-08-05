import type { Request as ExpressReq } from 'express';
import type { CreateGithubParams } from '../create-github-params.ts';
import { validateRepo } from '../validate-repo.ts';
import { domainFrom } from './domain-from.ts';
import { parseJson } from './http.ts';

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
