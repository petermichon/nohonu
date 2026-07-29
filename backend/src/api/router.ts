import { Router } from 'express';
import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { requireAuth } from '../shared/http.ts';
import { health } from './endpoints/health.ts';
import {
  auth,
  authRegister,
  authLogin,
  authLogout,
  authMe,
  authDisplayName,
  uploadProfilePicture,
  deleteProfilePicture,
  getSessions,
  deleteSession as deleteSessionEndpoint,
} from './endpoints/auth.ts';
import { checkDomain, checkCustomDomain, checkSubdomain } from './endpoints/check.ts';
import {
  getAllCustomDomains,
  getCustomDomains,
  addCustomDomain,
  deleteCustomDomain,
  verifyCustomDomain,
  getVerificationToken,
} from './endpoints/custom-domains.ts';
import {
  listSites,
  listExploreSites,
  getSiteInfo,
  downloadSite,
  getSiteIcon,
  getSiteCover,
  getSiteMeta,
  getSiteStats,
  getSiteVisitors,
  getSiteUptime,
  getSiteRepos,
  createSite,
  createSiteFromGithub,
  deleteSite,
  toggleSite,
  toggleStar,
  updateMeta,
  uploadCover,
  deleteCover,
  serveStatic,
} from './endpoints/sites.ts';
import {
  listSiteVersions,
  upload,
  fetchGithub,
  downloadSiteVersion,
  deleteVersion,
  activateVersion,
} from './endpoints/versions.ts';
import {
  getUserByUsernameEndpoint,
  getPublicSiteInfo,
  getUserSites,
  getUserStars,
  getProfilePicture,
} from './endpoints/users.ts';
import type { RouteContext } from './endpoints/sites-types.ts';

export const router = Router();

function toWebRequest(req: ExpressReq): Request {
  const url = new URL(req.originalUrl, `http://${req.headers.host ?? 'localhost'}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        for (const v of value) headers.append(key, v);
      } else {
        headers.set(key, value);
      }
    }
  }
  const rawBody = (req.method !== 'GET' && req.method !== 'HEAD') ? (req.body as Buffer | undefined) : undefined;
  const body = rawBody ? new Uint8Array(rawBody) : undefined;
  return new Request(url, { method: req.method, headers, body });
}

async function sendWebResponse(expressRes: ExpressRes, webResponse: Response): Promise<void> {
  webResponse.headers.forEach((value, key) => {
    expressRes.setHeader(key, value);
  });
  const body = await webResponse.arrayBuffer();
  if (body.byteLength > 0) {
    expressRes.status(webResponse.status).send(Buffer.from(body));
  } else {
    expressRes.status(webResponse.status).end();
  }
}

function buildCtx(req: ExpressReq): RouteContext {
  const p = req.params as Record<string, string | undefined>;
  const domain = p['domain'] ?? '';
  const action = p['action'];
  const subAction = p['subAction'];
  const timestamp = p['timestamp'] ? parseInt(p['timestamp'], 10) : undefined;
  return {
    domain,
    action,
    subAction,
    customDomain: action === 'custom-domains' ? subAction : undefined,
    timestamp,
    url: new URL(req.originalUrl, `http://${req.headers.host ?? 'localhost'}`),
  };
}

function wrap(fn: (req: Request) => Response | Promise<Response>): (req: ExpressReq, res: ExpressRes) => Promise<void> {
  return async (req, res) => {
    const webReq = toWebRequest(req);
    const authError = await requireAuth(webReq);
    if (authError) {
      await sendWebResponse(res, authError);
      return;
    }
    try {
      const response = await fn(webReq);
      await sendWebResponse(res, response);
    } catch (err) {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

function wrapCtx(fn: (req: Request, ctx: RouteContext) => Response | Promise<Response>): (req: ExpressReq, res: ExpressRes) => Promise<void> {
  return async (req, res) => {
    const webReq = toWebRequest(req);
    const authError = await requireAuth(webReq);
    if (authError) {
      await sendWebResponse(res, authError);
      return;
    }
    try {
      const ctx = buildCtx(req);
      const response = await fn(webReq, ctx);
      await sendWebResponse(res, response);
    } catch (err) {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

function wrapStrParam(fn: (req: Request, param: string) => Response | Promise<Response>, paramName: string): (req: ExpressReq, res: ExpressRes) => Promise<void> {
  return async (req, res) => {
    const webReq = toWebRequest(req);
    const authError = await requireAuth(webReq);
    if (authError) {
      await sendWebResponse(res, authError);
      return;
    }
    try {
      const param = (req.params as Record<string, string>)[paramName] ?? '';
      const response = await fn(webReq, param);
      await sendWebResponse(res, response);
    } catch (err) {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Health
router.get('/health', wrap(health));

// Auth
router.get('/auth', wrap(auth));
router.post('/auth/register', wrap(authRegister));
router.post('/auth/login', wrap(authLogin));
router.post('/auth/logout', wrap(authLogout));
router.get('/auth/me', wrap(authMe));
router.patch('/auth/displayname', wrap(authDisplayName));
router.post('/auth/profile-picture', wrap(uploadProfilePicture));
router.delete('/auth/profile-picture/delete', wrap(deleteProfilePicture));
router.get('/auth/sessions', wrap(getSessions));
router.delete('/auth/sessions/delete', wrap(deleteSessionEndpoint));

// Domain checks
router.get('/check-domain', wrap(checkDomain));
router.get('/check-custom-domain', wrap(checkCustomDomain));
router.get('/check-subdomain', wrap(checkSubdomain));

// Custom domains (global)
router.get('/custom-domains', wrap(getAllCustomDomains));

// Explore
router.get('/explore/sites', wrap(listExploreSites));

// Sites list
router.get('/sites', wrap(listSites));

// Site routes - GET
router.get('/sites/:domain', wrapCtx(getSiteInfo));
router.get('/sites/:domain/download', wrapCtx(downloadSite));
router.get('/sites/:domain/icon', wrapCtx(getSiteIcon));
router.get('/sites/:domain/cover', wrapCtx(getSiteCover));
router.get('/sites/:domain/meta', wrapCtx(getSiteMeta));
router.get('/sites/:domain/stats', wrapCtx(getSiteStats));
router.get('/sites/:domain/visitors', wrapCtx(getSiteVisitors));
router.get('/sites/:domain/uptime', wrapCtx(getSiteUptime));
router.get('/sites/:domain/repos', wrapCtx(getSiteRepos));

// Site versions
router.get('/sites/:domain/versions', wrapCtx(listSiteVersions));
router.get('/sites/:domain/versions/download', wrapCtx(downloadSiteVersion));

// Site custom domains - GET
router.get('/sites/:domain/custom-domains', wrapCtx(getCustomDomains));
router.get('/sites/:domain/custom-domains/token', wrapCtx(getVerificationToken));

// Site routes - POST
router.post('/sites/:domain', async (req: ExpressReq, res: ExpressRes) => {
  const webReq = toWebRequest(req);
  const authError = await requireAuth(webReq);
  if (authError) { await sendWebResponse(res, authError); return; }
  try {
    const ctx = buildCtx(req);
    const contentType = req.headers['content-type'] ?? '';
    const fn = contentType.includes('application/json') ? createSiteFromGithub : createSite;
    const response = await fn(webReq, ctx);
    await sendWebResponse(res, response);
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/sites/:domain/versions', wrapCtx(upload));
router.post('/sites/:domain/versions/github', wrapCtx(fetchGithub));
router.post('/sites/:domain/versions/:timestamp/activate', wrapCtx(activateVersion));
router.post('/sites/:domain/custom-domains', wrapCtx(addCustomDomain));
router.post('/sites/:domain/custom-domains/verify', wrapCtx(verifyCustomDomain));
router.post('/sites/:domain/cover', wrapCtx(uploadCover));

// Site routes - DELETE
router.delete('/sites/:domain', wrapCtx(deleteSite));
router.delete('/sites/:domain/versions/:timestamp', wrapCtx(deleteVersion));
router.delete('/sites/:domain/custom-domains/:subAction', wrapCtx(deleteCustomDomain));
router.delete('/sites/:domain/cover', wrapCtx(deleteCover));

// Site routes - PATCH
router.patch('/sites/:domain/toggle', wrapCtx(toggleSite));
router.patch('/sites/:domain/star', wrapCtx(toggleStar));
router.patch('/sites/:domain/meta', wrapCtx(updateMeta));

// User routes
router.get('/users/:username/sites', wrapStrParam(getUserSites, 'username'));
router.get('/users/:username/profile-picture', async (req: ExpressReq, res: ExpressRes) => {
  try {
    const webReq = toWebRequest(req);
    const username = (req.params as Record<string, string>)['username'] ?? '';
    const response = await getProfilePicture(webReq, username);
    await sendWebResponse(res, response);
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/users/:username/stars', wrapStrParam(getUserStars, 'username'));
router.get('/users/:username/:domain', async (req: ExpressReq, res: ExpressRes) => {
  const webReq = toWebRequest(req);
  const authError = await requireAuth(webReq);
  if (authError) { await sendWebResponse(res, authError); return; }
  try {
    const p = req.params as Record<string, string | undefined>;
    const response = await getPublicSiteInfo(webReq, p['username'] ?? '', p['domain'] ?? '');
    await sendWebResponse(res, response);
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/users/:username', async (req: ExpressReq, res: ExpressRes) => {
  const webReq = toWebRequest(req);
  const authError = await requireAuth(webReq);
  if (authError) { await sendWebResponse(res, authError); return; }
  try {
    const response = await getUserByUsernameEndpoint(webReq, req.path);
    await sendWebResponse(res, response);
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Static file serving - must be last (catch-all)
router.get('/{*path}', async (req: ExpressReq, res: ExpressRes) => {
  try {
    const webReq = toWebRequest(req);
    const remoteAddr = { hostname: req.ip ?? req.socket.remoteAddress ?? '' };
    const response = await serveStatic(webReq, req.path, { remoteAddr });
    await sendWebResponse(res, response);
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
