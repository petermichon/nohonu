import { error, json, parseJson, CORS, extractClientIp, requireUsername } from '../../shared/http.ts';
import { MAX_ZIP_BYTES, SUBDOMAIN_BASE } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from '../route-context.ts';

const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}

// === Params

function subdomainBaseFromRequest(req: Request): string {
  let base = SUBDOMAIN_BASE;
  if (base === 'localhost:8080') {
    const url = new URL(req.url);
    const port = url.port;
    base = port ? `${url.hostname}:${port}` : url.hostname;
  }
  return base;
}

type CreateSiteParams = { username: string; domain: string; zipData: Uint8Array; subdomain?: string };
async function extractCreateSiteParams(req: Request, { domain }: RouteContext): Promise<CreateSiteParams | Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const formData = await req.formData();
  const zipFile = formData.get('zip');
  if (!(zipFile instanceof File)) return error('Missing zip file');
  if (zipFile.size > MAX_ZIP_BYTES) return error(`Zip file too large (max ${MAX_ZIP_BYTES} bytes)`, 413);

  const buffer = await zipFile.arrayBuffer();
  const subdomain = formData.get('subdomain') as string | null || undefined;
  return { username, domain, zipData: new Uint8Array(buffer), subdomain };
}

type CreateGithubParams = { username: string; domain: string; repo: string; ref: string; subdomain?: string };
async function extractCreateGithubParams(req: Request, { domain }: RouteContext): Promise<CreateGithubParams | Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const body = await parseJson<{ repo?: unknown; branch?: unknown; subdomain?: unknown }>(req);
  if (body instanceof Response) return body;

  const repo = body.repo;
  if (!validateRepo(repo)) return error('Invalid repo format. Use owner/repo');

  const ref = typeof body.branch === 'string' && body.branch.length > 0 ? body.branch : 'main';
  const subdomain = typeof body.subdomain === 'string' ? body.subdomain : undefined;
  return { username, domain, repo, ref, subdomain };
}

type ToggleStarParams = { username: string; domain: string; starred: boolean };
async function extractToggleStarParams(req: Request, { domain }: RouteContext): Promise<ToggleStarParams | Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const body = await req.json().catch(() => ({}));
  return { username, domain, starred: body.starred === true };
}

type UpdateMetaParams = { username: string; domain: string; meta: { subdomain?: string; displayName?: string } };
async function extractUpdateMetaParams(req: Request, { domain }: RouteContext): Promise<UpdateMetaParams | Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const body = await parseJson<{ subdomain?: string; displayName?: string }>(req);
  if (body instanceof Response) return body;

  return { username, domain, meta: body };
}

type UploadCoverParams = { username: string; domain: string; data: Uint8Array };
async function extractUploadCoverParams(req: Request, { domain }: RouteContext): Promise<UploadCoverParams | Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const contentType = req.headers.get('Content-Type');
  if (!contentType?.startsWith('image/')) return error('Invalid content type, must be an image', 400);

  const body = await req.arrayBuffer();
  if (body.byteLength > 5_242_880) return error('Image too large, max 5MB', 400);

  return { username, domain, data: new Uint8Array(body) };
}

// === Responses

function siteInfoResponse(req: Request, domain: string, info: NonNullable<Awaited<ReturnType<typeof sites.getSiteInfo>>>): Response {
  return json({
    domain,
    siteId: info.siteId,
    enabled: info.enabled,
    subdomain: info.subdomain,
    subdomainBase: subdomainBaseFromRequest(req),
    displayName: info.displayName,
    account: info.account,
    coverImage: info.coverImage,
  });
}

function createSiteResponse(result: Awaited<ReturnType<typeof sites.createSite>>, domain: string): Response {
  return json({ success: true, domain, index: result.index }, 201);
}

function createSiteError(err: unknown): Response {
  const message = err instanceof Error ? err.message : 'Failed to create site';
  return error(message, message === 'Domain already exists for this user' ? 409 : 500);
}

// === Handlers

export async function listSites(req: Request): Promise<Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const siteList = await sites.listSites(username);
  return json({ sites: siteList });
}

export async function listExploreSites(req: Request): Promise<Response> {
  const username = req.headers.get('X-Username') || undefined;
  const allSites = await sites.listAllSites(username);
  return json({ sites: allSites });
}

export async function getSiteInfo(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const info = await sites.getSiteInfo(username, domain);
  if (!info) return error('Site not found', 404);

  return siteInfoResponse(req, domain, info);
}

export async function downloadSite(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) return error('Site not found', 404);

  const result = await sites.downloadActiveVersion(user, domain);
  if (!result) return error('Site not found', 404);

  return new Response(result.data as BodyInit, {
    headers: {
      ...CORS,
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    },
  });
}

export async function getSiteIcon(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) return new Response(undefined, { status: 404, headers: CORS });

  const result = await sites.getSiteIcon(user, domain);
  if (!result) return new Response(undefined, { status: 404, headers: CORS });

  return new Response(result.data.buffer as ArrayBuffer, {
    headers: { ...CORS, 'Content-Type': result.contentType, 'Cache-Control': 'public, max-age=300' },
  });
}

export async function getSiteCover(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) return new Response(undefined, { status: 404, headers: CORS });

  const result = await sites.getSiteCover(user, domain);
  if (!result) return new Response(undefined, { status: 404, headers: CORS });

  return new Response(result.buffer as ArrayBuffer, {
    headers: { ...CORS, 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=300' },
  });
}

export async function getSiteMeta(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const meta = await sites.getSiteMeta(username, domain);
  if (!meta) return error('Site not found', 404);
  return json({ domain, subdomain: meta.subdomain });
}

export function getSiteStats(_req: Request, { domain, url }: RouteContext): Response {
  const slotsParam = url.searchParams.get('slots') ?? '60';
  const slots = parseInt(slotsParam, 10);
  const count = isNaN(slots) ? 60 : slots;
  const groupParam = url.searchParams.get('group') ?? '1';
  const groupMinutes = parseInt(groupParam, 10);
  const group = isNaN(groupMinutes) ? 1 : groupMinutes;

  const stats = sites.getSiteStats(domain, count, group);
  return json({ domain, stats });
}

export function getSiteVisitors(_req: Request, { domain }: RouteContext): Response {
  const visitors = sites.getSiteVisitors(domain);
  return json({ domain, visitors });
}

export function getSiteUptime(_req: Request, { domain, url }: RouteContext): Response {
  const slotsParam = url.searchParams.get('slots') ?? '60';
  const slots = parseInt(slotsParam, 10);
  const count = isNaN(slots) ? 60 : slots;
  const groupParam = url.searchParams.get('group') ?? '1';
  const groupMinutes = parseInt(groupParam, 10);
  const group = isNaN(groupMinutes) ? 1 : groupMinutes;

  const uptime = sites.getSiteUptime(domain, count, group);
  return json({ domain, uptime });
}

export async function getSiteRepos(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const result = await sites.getSiteRepos(username, domain);
  if (!result) return error('Site not found', 404);
  return json({ domain, history: result.history });
}

export async function createSite(req: Request, ctx: RouteContext): Promise<Response> {
  const params = await extractCreateSiteParams(req, ctx);
  if (params instanceof Response) return params;

  try {
    const result = await sites.createSite(params.username, params.domain, params.zipData, params.subdomain);
    return createSiteResponse(result, params.domain);
  } catch (err) {
    return createSiteError(err);
  }
}

export async function createSiteDispatch(req: Request, ctx: RouteContext): Promise<Response> {
  const contentType = req.headers.get('Content-Type') || '';
  return contentType.includes('application/json') ? createSiteFromGithub(req, ctx) : createSite(req, ctx);
}

export async function createSiteFromGithub(req: Request, ctx: RouteContext): Promise<Response> {
  const params = await extractCreateGithubParams(req, ctx);
  if (params instanceof Response) return params;

  try {
    const result = await sites.createSiteFromGithub(params.username, params.domain, params.repo, params.ref, params.subdomain);
    return json({ domain: params.domain, index: result.index, repo: result.repo, branch: result.branch }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create site from GitHub';
    const status = message.includes('404') ? 404 : message === 'Domain already exists for this user' ? 409 : 502;
    return error(message, status);
  }
}

export async function deleteSite(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  await sites.deleteSite(username, domain);
  return json({ domain });
}

export async function toggleSite(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const result = await sites.toggleSite(username, domain);
  if (!result.ok) return error(result.error, result.status);
  return json({ domain, enabled: result.value.enabled });
}

export async function toggleStar(req: Request, ctx: RouteContext): Promise<Response> {
  const params = await extractToggleStarParams(req, ctx);
  if (params instanceof Response) return params;

  const result = await sites.toggleStar(params.username, params.domain, params.starred);
  if (!result.ok) return error(result.error, result.status);
  return json({ domain: params.domain, starred: result.value.starred, starCount: result.value.starCount });
}

export async function updateMeta(req: Request, ctx: RouteContext): Promise<Response> {
  const params = await extractUpdateMetaParams(req, ctx);
  if (params instanceof Response) return params;

  const result = await sites.updateSiteMeta(params.username, params.domain, params.meta);
  if (!result.ok) return error(result.error, result.status);
  return json({ domain: params.domain, subdomain: params.meta.subdomain, displayName: params.meta.displayName });
}

export async function uploadCover(req: Request, ctx: RouteContext): Promise<Response> {
  const params = await extractUploadCoverParams(req, ctx);
  if (params instanceof Response) return params;

  const result = await sites.uploadSiteCover(params.username, params.domain, params.data);
  if (!result.ok) return error(result.error, result.status);
  return json({ success: true });
}

export async function deleteCover(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const result = await sites.deleteSiteCover(username, domain);
  if (!result.ok) return error(result.error, result.status);
  return json({ success: true });
}

export async function serveStatic(req: Request, path: string): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  const host = req.headers.get('Host') ?? '';
  const resolved = await sites.resolveDomainAndServe(host, path);
  if (!resolved) return new Response('Not Found', { status: 404, headers: CORS });

  const result = await sites.serveSiteFile(resolved.user, resolved.domain, resolved.filePath);
  if (!result) return new Response('Site not found', { status: 404, headers: CORS });

  if (result.contentType === 'text/html') {
    const ip = extractClientIp(req, null);
    sites.recordPageHit(resolved.domain, ip);
  }

  return new Response(result.data as BodyInit, {
    headers: { ...CORS, 'Content-Type': result.contentType },
  });
}
