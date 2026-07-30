import { json, checkMethod, error, CORS } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import * as publicUser from '../../usecases/auth/publicUser.ts';
import { SUBDOMAIN_BASE } from '../../shared/paths.ts';

// === Params

function extractUsernameFromPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  return parts[1] || null;
}

// === Responses

function userNotFound() { return json({ error: 'User not found' }, 404); }
function siteNotFound() { return error('Site not found', 404); }

function publicSiteInfoResponse(req: Request, domain: string, info: NonNullable<Awaited<ReturnType<typeof sites.getSiteInfo>>>): Response {
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

// === Handlers

export async function getUserByUsernameEndpoint(req: Request, path: string): Promise<Response> {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return methodError;

  const username = extractUsernameFromPath(path);
  if (!username) return json({ error: 'Username required' }, 400);

  const user = await publicUser.getPublicUser(username);
  if (!user) return userNotFound();
  return json({ user }, 200);
}

export async function getPublicSiteInfo(req: Request, username: string, domain: string): Promise<Response> {
  if (!(await publicUser.userExists(username))) return userNotFound();

  const info = await sites.getSiteInfo(username, domain);
  if (!info) return siteNotFound();

  return publicSiteInfoResponse(req, domain, info);
}

export async function getUserSites(_req: Request, username: string): Promise<Response> {
  if (!(await publicUser.userExists(username))) return userNotFound();

  const siteList = await sites.listSites(username);
  return json({ sites: siteList });
}

export async function getUserStars(_req: Request, username: string): Promise<Response> {
  if (!(await publicUser.userExists(username))) return userNotFound();

  const starredSites = await sites.listStarredSites(username);
  return json({ sites: starredSites });
}

export async function getProfilePicture(_req: Request, username: string): Promise<Response> {
  const file = await publicUser.getProfilePictureFile(username);
  if (!file) return new Response('Not Found', { status: 404, headers: CORS });

  return new Response(file as BodyInit, {
    headers: { ...CORS, 'Content-Type': 'image/jpeg' },
  });
}
