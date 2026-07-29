import { error, json, parseJson, CORS, extractClientIp } from '../../shared/http.ts';
import { MAX_ZIP_BYTES, SUBDOMAIN_BASE } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}

export async function listSites(req: Request): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const siteList = await sites.listSites(username);
  return json({ sites: siteList });
}

export async function listExploreSites(req: Request): Promise<Response> {
  const username = req.headers.get('X-Username') || undefined;
  const allSites = await sites.listAllSites(username);
  return json({ sites: allSites });
}

export async function getSiteInfo(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const info = await sites.getSiteInfo(username, domain);
  if (!info) {
    return error('Site not found', 404);
  }

  let subdomainBase = SUBDOMAIN_BASE;
  if (subdomainBase === 'localhost:8080') {
    const url = new URL(req.url);
    const host = url.hostname;
    const port = url.port;
    subdomainBase = port ? `${host}:${port}` : host;
  }

  return json({
    domain,
    siteId: info.siteId,
    enabled: info.enabled,
    subdomain: info.subdomain,
    subdomainBase,
    displayName: info.displayName,
    account: info.account,
    coverImage: info.coverImage,
  });
}

export async function downloadSite(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) {
    return error('Site not found', 404);
  }
  const result = await sites.downloadActiveVersion(user, domain);
  if (!result) {
    return error('Site not found', 404);
  }
  const headers = {
    ...CORS,
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${result.filename}"`,
  };
  return new Response(result.data as BodyInit, { headers });
}

export async function getSiteIcon(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) {
    return new Response(undefined, { status: 404, headers: CORS });
  }
  const result = await sites.getSiteIcon(user, domain);
  if (!result) {
    return new Response(undefined, { status: 404, headers: CORS });
  }
  const headers = { ...CORS, 'Content-Type': result.contentType, 'Cache-Control': 'public, max-age=300' };
  return new Response(result.data.buffer as ArrayBuffer, { headers });
}

export async function getSiteCover(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) {
    return new Response(undefined, { status: 404, headers: CORS });
  }
  const result = await sites.getSiteCover(user, domain);
  if (!result) {
    return new Response(undefined, { status: 404, headers: CORS });
  }
  const headers = { ...CORS, 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=300' };
  return new Response(result.buffer as ArrayBuffer, { headers });
}

export async function getSiteMeta(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const meta = await sites.getSiteMeta(username, domain);
  if (!meta) {
    return error('Site not found', 404);
  }
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
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const result = await sites.getSiteRepos(username, domain);
  if (!result) {
    return error('Site not found', 404);
  }
  return json({ domain, history: result.history });
}

export async function createSite(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const formData = await req.formData();
  const zipFile = formData.get('zip');
  const subdomain = formData.get('subdomain') as string | null;

  if (!(zipFile instanceof File)) {
    return error('Missing zip file');
  }

  if (zipFile.size > MAX_ZIP_BYTES) {
    return error(`Zip file too large (max ${MAX_ZIP_BYTES} bytes)`, 413);
  }

  const buffer = await zipFile.arrayBuffer();
  const zipData = new Uint8Array(buffer);

  try {
    const result = await sites.createSite(username, domain, zipData);
    await sites.setSiteAccount(username, domain, username);
    if (subdomain) {
      await sites.updateSiteMeta(username, domain, { subdomain });
    }
    return json({ success: true, domain, index: result.index }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create site';
    return error(message, message === 'Domain already exists for this user' ? 409 : 500);
  }
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

export async function deleteSite(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  await sites.deleteSite(username, domain);
  return json({ domain });
}

export async function toggleSite(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const result = await sites.toggleSite(username, domain);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, enabled: result.value.enabled });
}

export async function toggleStar(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const body = await req.json().catch(() => ({}));
  const starred = body.starred === true;

  const result = await sites.toggleStar(username, domain, starred);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, starred: result.value.starred, starCount: result.value.starCount });
}

export async function updateMeta(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const body = await parseJson<{ subdomain?: string | undefined; displayName?: string | undefined }>(req);
  if (body instanceof Response) return body;

  const result = await sites.updateSiteMeta(username, domain, body);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, subdomain: body.subdomain, displayName: body.displayName });
}

export async function uploadCover(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const contentType = req.headers.get('Content-Type');
  if (!contentType?.startsWith('image/')) {
    return error('Invalid content type, must be an image', 400);
  }

  const body = await req.arrayBuffer();
  if (body.byteLength > 5_242_880) {
    return error('Image too large, max 5MB', 400);
  }

  const result = await sites.uploadSiteCover(username, domain, new Uint8Array(body));
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ success: true });
}

export async function deleteCover(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const result = await sites.deleteSiteCover(username, domain);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ success: true });
}

export async function serveStatic(req: Request, path: string, info: { remoteAddr: { hostname?: string } }): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  const host = req.headers.get('Host') ?? '';
  const resolved = await sites.resolveDomainAndServe(host, path);
  if (!resolved) return new Response('Not Found', { status: 404, headers: CORS });

  const result = await sites.serveSiteFile(resolved.user, resolved.domain, resolved.filePath);
  if (!result) return new Response('Site not found', { status: 404, headers: CORS });

  if (result.contentType === 'text/html') {
    const ip = extractClientIp(req, info.remoteAddr);
    sites.recordPageHit(resolved.domain, ip);
  }

  const responseHeaders = { ...CORS, 'Content-Type': result.contentType };
  return new Response(result.data as BodyInit, { headers: responseHeaders });
}
