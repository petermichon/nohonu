import { error, json, parseJson } from '../../shared/http.ts';
import { MAX_ZIP_BYTES } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from '../route-context.ts';

const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}

export async function listSiteVersions(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) {
    return json({ domain, versions: [], current: null });
  }
  const result = await sites.listVersions(user, domain);
  if (!result) {
    return json({ domain, versions: [], current: null });
  }
  return json({ domain, versions: result.versions, current: result.current });
}

export async function upload(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const formData = await req.formData();
  const zipFile = formData.get('zip');

  if (!(zipFile instanceof File)) {
    return error('Missing zip file');
  }

  if (zipFile.size > MAX_ZIP_BYTES) {
    return error(`Zip file too large (max ${MAX_ZIP_BYTES} bytes)`, 413);
  }

  const buffer = await zipFile.arrayBuffer();
  const zipData = new Uint8Array(buffer);

  try {
    const result = await sites.uploadVersion(username, domain, zipData);
    return json({ success: true, domain, index: result.index });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to upload version';
    return error(message, message === 'Site not found' ? 404 : 500);
  }
}

export async function fetchGithub(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
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
    const result = await sites.uploadVersionFromGithub(username, domain, repo, ref);
    return json({ domain, index: result.index, repo: result.repo, branch: result.branch });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to upload version from GitHub';
    const status = message.includes('404') ? 404 : message === 'Site not found' ? 404 : 502;
    return error(message, status);
  }
}

export async function downloadSiteVersion(req: Request, { domain, timestamp: index }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  if (!index) {
    return error('Version timestamp required', 400);
  }
  const result = await sites.downloadVersion(username, domain, index);
  if (!result) {
    return error('Version not found', 404);
  }
  const headers = {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${result.filename}"`,
  };
  return new Response(result.data as BodyInit, { headers });
}

export async function deleteVersion(req: Request, { domain, timestamp: index }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  if (!index || isNaN(index)) return error('Invalid index');
  const result = await sites.deleteVersion(username, domain, index);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, index });
}

export async function activateVersion(req: Request, { domain, timestamp: index }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  if (!index || isNaN(index)) return error('Invalid index');
  const result = await sites.activateVersion(username, domain, index);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, index });
}
