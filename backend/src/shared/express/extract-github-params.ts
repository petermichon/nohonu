import type { Request as ExpressReq } from 'express';
import type { GithubParams } from '../github-params.ts';
import { validateRepo } from '../validate-repo.ts';
import { domainFrom } from './domain-from.ts';
import { parseJson } from './http.ts';

export async function extractGithubParams(req: ExpressReq): Promise<GithubParams | undefined> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const body = await parseJson<{ repo?: unknown; branch?: unknown }>(req);
  if (!body || !validateRepo(body.repo)) return;

  return {
    sessionId,
    domain: domainFrom(req),
    repo: body.repo,
    ref: typeof body.branch === 'string' && body.branch.length > 0 ? body.branch : 'main',
  };
}
