import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, parseJson } from '../../shared/http.ts';
import { MAX_ZIP_BYTES } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';

const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}

function domainFrom(req: ExpressReq): string { return (req.params as Record<string, string>)['domain'] || ''; }

// === Params

type CreateSiteParams = { sessionId: string; domain: string; zipData: Uint8Array; subdomain?: string };
function extractCreateSiteParams(req: ExpressReq): CreateSiteParams | undefined {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const buffer = req.body instanceof Buffer ? req.body : undefined;
  if (!buffer || buffer.length === 0) return;
  if (buffer.length > MAX_ZIP_BYTES) return;

  return { sessionId, domain: domainFrom(req), zipData: new Uint8Array(buffer) };
}

type CreateGithubParams = { sessionId: string; domain: string; repo: string; ref: string; subdomain?: string };
async function extractCreateGithubParams(req: ExpressReq): Promise<CreateGithubParams | undefined> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const body = await parseJson<{ repo?: unknown; branch?: unknown; subdomain?: unknown }>(req);
  if (!body || !validateRepo(body.repo)) return;

  const subdomain = typeof body.subdomain === 'string' ? body.subdomain : undefined;
  return { sessionId, domain: domainFrom(req), repo: body.repo, ref: typeof body.branch === 'string' && body.branch.length > 0 ? body.branch : 'main', subdomain };
}

type ToggleStarParams = { sessionId: string; domain: string; starred: boolean };
async function extractToggleStarParams(req: ExpressReq): Promise<ToggleStarParams | undefined> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const body = await parseJson<{ starred?: boolean }>(req);
  return { sessionId, domain: domainFrom(req), starred: body?.starred === true };
}

type UpdateMetaParams = { sessionId: string; domain: string; meta: { subdomain?: string; displayName?: string } };
async function extractUpdateMetaParams(req: ExpressReq): Promise<UpdateMetaParams | undefined> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const body = await parseJson<{ subdomain?: string; displayName?: string }>(req);
  if (!body) return;

  return { sessionId, domain: domainFrom(req), meta: body };
}

type UploadCoverParams = { sessionId: string; domain: string; data: Uint8Array };
function extractUploadCoverParams(req: ExpressReq): UploadCoverParams | undefined {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) return;

  const contentType = req.get('Content-Type') || '';
  if (!contentType.startsWith('image/')) return;

  const buffer = req.body instanceof Buffer ? req.body : undefined;
  if (!buffer || buffer.byteLength > 5_242_880) return;

  return { sessionId, domain: domainFrom(req), data: new Uint8Array(buffer) };
}

// === Handlers

export async function listSites(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) { json(res, { error: 'Missing username' }, 401); return; }

  json(res, { sites: await sites.listSites(sessionId) });
}

export async function listExploreSites(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = req.get('X-Username') || undefined;
  json(res, { sites: await sites.listAllSites(username) });
}

export async function getSiteInfo(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) { json(res, { error: 'Missing username' }, 401); return; }

  const info = await sites.getSiteInfo(sessionId, domainFrom(req));
  if (!info) { json(res, { error: 'Site not found' }, 404); return; }

  json(res, {
    domain: domainFrom(req),
    siteId: info.siteId,
    enabled: info.enabled,
    subdomain: info.subdomain,
    subdomainBase: req.headers.host || 'localhost:8080',
    displayName: info.displayName,
    account: info.account,
    coverImage: info.coverImage,
  });
}

export async function downloadSite(req: ExpressReq, res: ExpressRes): Promise<void> {
  const domain = domainFrom(req);
  const user = await sites.findUserForDomain(domain);
  if (!user) { json(res, { error: 'Site not found' }, 404); return; }

  const result = await sites.downloadActiveVersion(user, domain);
  if (!result) { json(res, { error: 'Site not found' }, 404); return; }

  res.set('Content-Type', 'application/zip');
  res.set('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(Buffer.from(result.data));
}

export async function getSiteIcon(req: ExpressReq, res: ExpressRes): Promise<void> {
  const domain = domainFrom(req);
  const user = await sites.findUserForDomain(domain);
  if (!user) { res.status(404).end(); return; }

  const result = await sites.getSiteIcon(user, domain);
  if (!result) { res.status(404).end(); return; }

  res.set('Content-Type', result.contentType);
  res.set('Cache-Control', 'public, max-age=300');
  res.send(Buffer.from(result.data.buffer));
}

export async function getSiteCover(req: ExpressReq, res: ExpressRes): Promise<void> {
  const domain = domainFrom(req);
  const user = await sites.findUserForDomain(domain);
  if (!user) { res.status(404).end(); return; }

  const result = await sites.getSiteCover(user, domain);
  if (!result) { res.status(404).end(); return; }

  res.set('Content-Type', 'image/jpeg');
  res.set('Cache-Control', 'public, max-age=300');
  res.send(Buffer.from(result.buffer));
}

export async function getSiteMeta(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) { json(res, { error: 'Missing username' }, 401); return; }

  const meta = await sites.getSiteMeta(sessionId, domainFrom(req));
  if (!meta) { json(res, { error: 'Site not found' }, 404); return; }
  json(res, { domain: domainFrom(req), subdomain: meta.subdomain });
}

export function getSiteStats(req: ExpressReq, res: ExpressRes): void {
  const slots = Math.min(parseInt(req.query.slots as string) || 60, 10080);
  const group = Math.min(parseInt(req.query.group as string) || 1, 60);
  const stats = sites.getSiteStats(domainFrom(req), slots, group);
  json(res, { domain: domainFrom(req), stats });
}

export function getSiteVisitors(req: ExpressReq, res: ExpressRes): void {
  json(res, { domain: domainFrom(req), visitors: sites.getSiteVisitors(domainFrom(req)) });
}

export function getSiteUptime(req: ExpressReq, res: ExpressRes): void {
  const slots = Math.min(parseInt(req.query.slots as string) || 60, 10080);
  const group = Math.min(parseInt(req.query.group as string) || 1, 60);
  json(res, { domain: domainFrom(req), uptime: sites.getSiteUptime(domainFrom(req), slots, group) });
}

export async function getSiteRepos(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) { json(res, { error: 'Missing username' }, 401); return; }

  const result = await sites.getSiteRepos(sessionId, domainFrom(req));
  if (!result) { json(res, { error: 'Site not found' }, 404); return; }
  json(res, { domain: domainFrom(req), history: result.history });
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
  if (!params) { json(res, { error: 'Missing zip file' }, 400); return; }

  try {
    const result = await sites.createSite(params.sessionId, params.domain, params.zipData, params.subdomain);
    json(res, { success: true, domain: params.domain, index: result.index }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create site';
    json(res, { error: message }, message === 'Domain already exists for this user' ? 409 : 500);
  }
}

async function createSiteFromGithub(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractCreateGithubParams(req);
  if (!params) { json(res, { error: 'Invalid repo format. Use owner/repo' }, 400); return; }

  try {
    const result = await sites.createSiteFromGithub(params.sessionId, params.domain, params.repo, params.ref, params.subdomain);
    json(res, { domain: params.domain, index: result.index, repo: result.repo, branch: result.branch }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create site from GitHub';
    json(res, { error: message }, message.includes('404') ? 404 : message === 'Domain already exists for this user' ? 409 : 502);
  }
}

export async function deleteSite(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) { json(res, { error: 'Missing username' }, 401); return; }

  await sites.deleteSite(sessionId, domainFrom(req));
  json(res, { domain: domainFrom(req) });
}

export async function toggleSite(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) { json(res, { error: 'Missing username' }, 401); return; }

  const result = await sites.toggleSite(sessionId, domainFrom(req));
  if (!result.ok) { json(res, { error: result.error }, result.status); return; }
  json(res, { domain: domainFrom(req), enabled: result.value.enabled });
}

export async function toggleStar(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractToggleStarParams(req);
  if (!params) { json(res, { error: 'Missing username' }, 401); return; }

  const result = await sites.toggleStar(params.sessionId, params.domain, params.starred);
  if (!result.ok) { json(res, { error: result.error }, result.status); return; }
  json(res, { domain: params.domain, starred: result.value.starred, starCount: result.value.starCount });
}

export async function updateMeta(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractUpdateMetaParams(req);
  if (!params) { json(res, { error: 'Missing username or body' }, 400); return; }

  const result = await sites.updateSiteMeta(params.sessionId, params.domain, params.meta);
  if (!result.ok) { json(res, { error: result.error }, result.status); return; }
  json(res, { domain: params.domain, subdomain: params.meta.subdomain, displayName: params.meta.displayName });
}

export async function uploadCover(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = extractUploadCoverParams(req);
  if (!params) { json(res, { error: 'Invalid image' }, 400); return; }

  const result = await sites.uploadSiteCover(params.sessionId, params.domain, params.data);
  if (!result.ok) { json(res, { error: result.error }, result.status); return; }
  json(res, { success: true });
}

export async function deleteCover(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) { json(res, { error: 'Missing username' }, 401); return; }

  const result = await sites.deleteSiteCover(sessionId, domainFrom(req));
  if (!result.ok) { json(res, { error: result.error }, result.status); return; }
  json(res, { success: true });
}

export async function serveStatic(req: ExpressReq, res: ExpressRes): Promise<void> {
  const host = req.get('Host') ?? '';
  const resolved = await sites.resolveDomainAndServe(host, req.path);
  if (!resolved) { res.status(404).end(); return; }

  const result = await sites.serveSiteFile(resolved.user, resolved.domain, resolved.filePath);
  if (!result) { res.status(404).end(); return; }

  if (result.contentType === 'text/html') {
    sites.recordPageHit(resolved.domain, req.ip || 'unknown');
  }

  res.set('Content-Type', result.contentType);
  res.send(Buffer.from(result.data));
}
