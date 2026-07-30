import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, p } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import * as publicUser from '../../usecases/auth/publicUser.ts';

function userNotFound(res: ExpressRes) { json(res, { error: 'User not found' }, 404); }

export async function getUserByUsernameEndpoint(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = (req.params as Record<string, string>)['username'];
  if (!username) { json(res, { error: 'Username required' }, 400); return; }

  const user = await publicUser.getPublicUser(username);
  if (!user) { userNotFound(res); return; }
  json(res, { user }, 200);
}

export async function getPublicSiteInfo(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = (req.params as Record<string, string>)['username'] || '';
  const domain = (req.params as Record<string, string>)['domain'] || '';
  if (!username || !(await publicUser.userExists(username))) { userNotFound(res); return; }

  const info = await sites.getSiteInfo(username, domain);
  if (!info) { json(res, { error: 'Site not found' }, 404); return; }

  json(res, {
    domain,
    siteId: info.siteId,
    enabled: info.enabled,
    subdomain: info.subdomain,
    subdomainBase: req.headers.host || 'localhost:8080',
    displayName: info.displayName,
    account: info.account,
    coverImage: info.coverImage,
  });
}

export async function getUserSites(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = (req.params as Record<string, string>)['username'];
  if (!username) { userNotFound(res); return; }
  if (!(await publicUser.userExists(username))) { userNotFound(res); return; }

  const siteList = await sites.listSites(username);
  json(res, { sites: siteList });
}

export async function getUserStars(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = (req.params as Record<string, string>)['username'];
  if (!username) { userNotFound(res); return; }
  if (!(await publicUser.userExists(username))) { userNotFound(res); return; }

  const starredSites = await sites.listStarredSites(username);
  json(res, { sites: starredSites });
}

export async function getProfilePicture(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = (req.params as Record<string, string>)['username'] || '';
  const file = await publicUser.getProfilePictureFile(username);
  if (!file) { res.status(404).end(); return; }

  res.set('Content-Type', 'image/jpeg');
  res.send(Buffer.from(file));
}
