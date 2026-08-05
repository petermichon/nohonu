import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, parseJson } from '../../../shared/express/http.ts';
import { domainFrom } from '../../../shared/express/domain-from.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { MAX_ZIP_BYTES } from '../../../shared/paths.ts';
import { createSite } from '../../../usecases/sites/create-site.ts';
import { createSiteFromGithub as createSiteFromGithubUsecase } from '../../../usecases/sites/create-site-from-github.ts';

const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;

function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}

type CreateSiteParams = { sessionId: string; domain: string; zipData: Uint8Array; subdomain?: string };

function extractCreateSiteParams(req: ExpressReq): CreateSiteParams | undefined {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const buffer = req.body instanceof Buffer ? req.body : undefined;
  if (!buffer || buffer.length === 0) return;
  if (buffer.length > MAX_ZIP_BYTES) return;

  const subdomain = typeof req.query.subdomain === 'string' ? req.query.subdomain : undefined;
  return { sessionId, domain: domainFrom(req), zipData: new Uint8Array(buffer), subdomain };
}

type CreateGithubParams = { sessionId: string; domain: string; repo: string; ref: string; subdomain?: string };

async function extractCreateGithubParams(req: ExpressReq): Promise<CreateGithubParams | undefined> {
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

export async function createSiteDispatch(req: ExpressReq, res: ExpressRes): Promise<void> {
  const contentType = req.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    await createSiteFromGithub(req, res);
  } else {
    await createSiteRaw(req, res);
  }
}

async function createSiteRaw(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = extractCreateSiteParams(req);
  if (!params) {
    json(res, { error: 'Missing zip file' }, 400);
    return;
  }

  const result = await createSite(params.sessionId, params.domain, params.zipData, params.subdomain);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { success: true, domain: params.domain, index: result.value.index }, 201);
}

async function createSiteFromGithub(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractCreateGithubParams(req);
  if (!params) {
    json(res, { error: 'Invalid repo format. Use owner/repo' }, 400);
    return;
  }

  const result = await createSiteFromGithubUsecase(
    params.sessionId,
    params.domain,
    params.repo,
    params.ref,
    params.subdomain,
  );
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  const value = result.value;
  json(res, { domain: params.domain, index: value.index, repo: value.repo, branch: value.branch }, 201);
}
