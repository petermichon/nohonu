import { error, json, parseJson } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}

export async function createSiteFromGithub(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const body = await parseJson<{ repo?: unknown; branch?: unknown; subdomain?: unknown }>(req);
  if (body instanceof Response) {
    return body;
  }

  const repo = body.repo;
  if (!validateRepo(repo)) {
    return error('Invalid repo format. Use owner/repo');
  }

  const ref = typeof body.branch === 'string' && body.branch.length > 0 ? body.branch : 'main';
  const subdomain = typeof body.subdomain === 'string' ? body.subdomain : null;

  try {
    const result = await sites.createSiteFromGithub(username, domain, repo, ref);
    await sites.setSiteAccount(username, domain, username);
    // Set custom subdomain if provided
    if (subdomain) {
      await sites.updateSiteMeta(username, domain, { subdomain });
    }
    return json({ domain, index: result.index, repo: result.repo, branch: result.branch }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create site from GitHub';
    const status = message.includes('404') ? 404 : message === 'Domain already exists for this user' ? 409 : 502;
    return error(message, status);
  }
}
