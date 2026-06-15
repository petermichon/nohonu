import { error, json, parseJson } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}

export async function fetchGithub(req: Request, { domain }: RouteContext): Promise<Response> {
  const body = await parseJson<{ repo?: unknown; branch?: unknown }>(req);
  if (body instanceof Response) {
    return body;
  }

  const repo = body.repo;
  if (!validateRepo(repo)) {
    return error('Invalid repo format. Use owner/repo');
  }

  const ref = typeof body.branch === 'string' && body.branch.length > 0 ? body.branch : 'main';

  try {
    const result = await sites.deployFromGithub(domain, repo, ref);

    const account = req.headers.get('X-Account');
    if (account) {
      await sites.setSiteAccount(domain, account);
    }

    return json({ domain, index: result.index, repo: result.repo, branch: result.branch });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to deploy from GitHub';
    const status = message.includes('404') ? 404 : 502;
    return error(message, status);
  }
}
