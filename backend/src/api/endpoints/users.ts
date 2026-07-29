import * as fs from 'node:fs/promises';
import { json, checkMethod, error, CORS } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import * as storage from '../../core/sites/storage.ts';
import * as users from '../../core/auth/users.ts';
import { SUBDOMAIN_BASE } from '../../shared/paths.ts';

export async function getUserByUsernameEndpoint(req: Request, path: string): Promise<Response> {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return methodError;

  const parts = path.split('/').filter(Boolean);
  const username = parts[1];

  if (!username) {
    return json({ error: 'Username required' }, 400);
  }

  const user = await users.getUserByUsername(username);

  if (!user) {
    return json({ error: 'User not found' }, 404);
  }

  return json(
    {
      user: {
        username: user.username,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
      },
    },
    200,
  );
}

export async function getPublicSiteInfo(req: Request, username: string, domain: string): Promise<Response> {
  const userList = await storage.listUsers();
  if (!userList.includes(username)) {
    return error('User not found', 404);
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

export async function getUserSites(_req: Request, username: string): Promise<Response> {
  const userList = await storage.listUsers();
  if (!userList.includes(username)) {
    return error('User not found', 404);
  }

  const siteList = await sites.listSites(username);
  return json({ sites: siteList });
}

export async function getUserStars(_req: Request, username: string): Promise<Response> {
  const userList = await storage.listUsers();
  if (!userList.includes(username)) {
    return error('User not found', 404);
  }

  const starredSites = await sites.listStarredSites(username);
  return json({ sites: starredSites });
}

export async function getProfilePicture(req: Request, username: string): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  const user = await users.getUserByUsername(username);
  if (!user || !user.profilePicture) {
    return new Response('Not Found', { status: 404, headers: CORS });
  }

  try {
    const profilePicturePath = users.getProfilePicturePath(username);
    const file = await fs.readFile(profilePicturePath);
    return new Response(file, {
      headers: { ...CORS, 'Content-Type': 'image/jpeg' },
    });
  } catch {
    return new Response('Not Found', { status: 404, headers: CORS });
  }
}
