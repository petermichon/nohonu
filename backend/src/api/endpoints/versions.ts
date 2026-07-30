import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, parseJson, p } from '../../shared/http.ts';
import { MAX_ZIP_BYTES } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';

const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}

function domainFrom(req: ExpressReq): string { return p(req, 'domain'); }
function indexFrom(req: ExpressReq): number | undefined {
  const val = p(req, 'timestamp');
  if (!val || isNaN(Number(val))) return undefined;
  return Number(val);
}

// === Params

type UploadParams = { sessionId: string; domain: string; zipData: Uint8Array };
function extractUploadParams(req: ExpressReq): UploadParams | undefined {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const buffer = req.body instanceof Buffer ? req.body : undefined;
  if (!buffer || buffer.length === 0) return;
  if (buffer.length > MAX_ZIP_BYTES) return;

  return { sessionId, domain: domainFrom(req), zipData: new Uint8Array(buffer) };
}

type GithubParams = { sessionId: string; domain: string; repo: string; ref: string };
async function extractGithubParams(req: ExpressReq): Promise<GithubParams | undefined> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const body = await parseJson<{ repo?: unknown; branch?: unknown }>(req);
  if (!body || !validateRepo(body.repo)) return;

  return { sessionId, domain: domainFrom(req), repo: body.repo, ref: typeof body.branch === 'string' && body.branch.length > 0 ? body.branch : 'main' };
}

// === Handlers

export async function listSiteVersions(req: ExpressReq, res: ExpressRes): Promise<void> {
  const domain = domainFrom(req);
  const user = await sites.findUserForDomain(domain);
  if (!user) { json(res, { domain, versions: [], current: null }); return; }

  const result = await sites.listVersions(user, domain);
  if (!result) { json(res, { domain, versions: [], current: null }); return; }
  json(res, { domain, versions: result.versions, current: result.current });
}

export async function upload(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = extractUploadParams(req);
  if (!params) { json(res, { error: 'Missing zip file' }, 400); return; }

  try {
    const result = await sites.uploadVersion(params.sessionId, params.domain, params.zipData);
    json(res, { success: true, domain: params.domain, index: result.index });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to upload version';
    json(res, { error: message }, message === 'Site not found' ? 404 : 500);
  }
}

export async function fetchGithub(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractGithubParams(req);
  if (!params) { json(res, { error: 'Invalid repo format. Use owner/repo' }, 400); return; }

  try {
    const result = await sites.uploadVersionFromGithub(params.sessionId, params.domain, params.repo, params.ref);
    json(res, { domain: params.domain, index: result.index, repo: result.repo, branch: result.branch });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to upload version from GitHub';
    json(res, { error: message }, message.includes('404') ? 404 : message === 'Site not found' ? 404 : 502);
  }
}

export async function downloadSiteVersion(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) { json(res, { error: 'Missing username' }, 401); return; }

  const idx = indexFrom(req);
  if (idx === undefined) { json(res, { error: 'Version timestamp required' }, 400); return; }

  const result = await sites.downloadVersion(sessionId, domainFrom(req), idx);
  if (!result) { json(res, { error: 'Version not found' }, 404); return; }

  res.set('Content-Type', 'application/zip');
  res.set('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(Buffer.from(result.data));
}

export async function deleteVersion(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) { json(res, { error: 'Missing username' }, 401); return; }

  const idx = indexFrom(req);
  if (idx === undefined) { json(res, { error: 'Invalid index' }, 400); return; }

  const result = await sites.deleteVersion(sessionId, domainFrom(req), idx);
  if (!result.ok) { json(res, { error: result.error }, result.status); return; }
  json(res, { domain: domainFrom(req), index: idx });
}

export async function activateVersion(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) { json(res, { error: 'Missing username' }, 401); return; }

  const idx = indexFrom(req);
  if (idx === undefined) { json(res, { error: 'Invalid index' }, 400); return; }

  const result = await sites.activateVersion(sessionId, domainFrom(req), idx);
  if (!result.ok) { json(res, { error: result.error }, result.status); return; }
  json(res, { domain: domainFrom(req), index: idx });
}
