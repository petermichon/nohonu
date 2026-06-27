import { error, json, parseJson } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import * as storage from '../../core/sites/storage.ts';
import type { RouteContext } from './sites-types.ts';

const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}

export async function fetchGithub(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  // Check if domain already exists for this user
  const existingData = await storage.readSiteMetadata(username, domain);
  if (existingData) {
    return error('Domain already exists for this user', 409);
  }

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
    const result = await sites.deployFromGithub(username, domain, repo, ref);

    await sites.setSiteAccount(username, domain, username);

    return json({ domain, index: result.index, repo: result.repo, branch: result.branch });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to deploy from GitHub';
    const status = message.includes('404') ? 404 : 502;
    return error(message, status);
  }
}
