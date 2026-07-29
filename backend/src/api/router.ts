import { Router } from 'express';
import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { requireAuth } from '../usecases/requireAuth.ts';
import { health } from './endpoints/health.ts';
import * as auth from './endpoints/auth.ts';
import * as check from './endpoints/check.ts';
import * as customDomains from './endpoints/custom-domains.ts';
import * as sites from './endpoints/sites.ts';
import * as versions from './endpoints/versions.ts';
import * as users from './endpoints/users.ts';
import { buildCtx, type RouteContext } from './route-context.ts';

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
router.get('/auth', wrap(auth.auth));
router.post('/auth/register', wrap(auth.authRegister));
router.post('/auth/login', wrap(auth.authLogin));
router.post('/auth/logout', wrap(auth.authLogout));
router.get('/auth/me', wrap(auth.authMe));
router.patch('/auth/displayname', wrap(auth.authDisplayName));
router.post('/auth/profile-picture', wrap(auth.uploadProfilePicture));
router.delete('/auth/profile-picture/delete', wrap(auth.deleteProfilePicture));
router.get('/auth/sessions', wrap(auth.getSessions));
router.delete('/auth/sessions/delete', wrap(auth.deleteSession));

// Domain checks
router.get('/check-domain', wrap(check.checkDomain));
router.get('/check-custom-domain', wrap(check.checkCustomDomain));
router.get('/check-subdomain', wrap(check.checkSubdomain));

// Custom domains (global)
router.get('/custom-domains', wrap(customDomains.getAllCustomDomains));

// Explore
router.get('/explore/sites', wrap(sites.listExploreSites));

// Sites list
router.get('/sites', wrap(sites.listSites));

// Site routes - GET
router.get('/sites/:domain', wrapCtx(sites.getSiteInfo));
router.get('/sites/:domain/download', wrapCtx(sites.downloadSite));
router.get('/sites/:domain/icon', wrapCtx(sites.getSiteIcon));
router.get('/sites/:domain/cover', wrapCtx(sites.getSiteCover));
router.get('/sites/:domain/meta', wrapCtx(sites.getSiteMeta));
router.get('/sites/:domain/stats', wrapCtx(sites.getSiteStats));
router.get('/sites/:domain/visitors', wrapCtx(sites.getSiteVisitors));
router.get('/sites/:domain/uptime', wrapCtx(sites.getSiteUptime));
router.get('/sites/:domain/repos', wrapCtx(sites.getSiteRepos));

// Site versions
router.get('/sites/:domain/versions', wrapCtx(versions.listSiteVersions));
router.get('/sites/:domain/versions/download', wrapCtx(versions.downloadSiteVersion));

// Site custom domains - GET
router.get('/sites/:domain/custom-domains', wrapCtx(customDomains.getCustomDomains));
router.get('/sites/:domain/custom-domains/token', wrapCtx(customDomains.getVerificationToken));

// Site routes - POST
router.post('/sites/:domain', async (req: ExpressReq, res: ExpressRes) => {
  const webReq = toWebRequest(req);
  const authError = await requireAuth(webReq);
  if (authError) { await sendWebResponse(res, authError); return; }
  try {
    const ctx = buildCtx(req);
    const contentType = req.headers['content-type'] ?? '';
    const fn = contentType.includes('application/json') ? sites.createSiteFromGithub : sites.createSite;
    const response = await fn(webReq, ctx);
    await sendWebResponse(res, response);
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/sites/:domain/versions', wrapCtx(versions.upload));
router.post('/sites/:domain/versions/github', wrapCtx(versions.fetchGithub));
router.post('/sites/:domain/versions/:timestamp/activate', wrapCtx(versions.activateVersion));
router.post('/sites/:domain/custom-domains', wrapCtx(customDomains.addCustomDomain));
router.post('/sites/:domain/custom-domains/verify', wrapCtx(customDomains.verifyCustomDomain));
router.post('/sites/:domain/cover', wrapCtx(sites.uploadCover));

// Site routes - DELETE
router.delete('/sites/:domain', wrapCtx(sites.deleteSite));
router.delete('/sites/:domain/versions/:timestamp', wrapCtx(versions.deleteVersion));
router.delete('/sites/:domain/custom-domains/:subAction', wrapCtx(customDomains.deleteCustomDomain));
router.delete('/sites/:domain/cover', wrapCtx(sites.deleteCover));

// Site routes - PATCH
router.patch('/sites/:domain/toggle', wrapCtx(sites.toggleSite));
router.patch('/sites/:domain/star', wrapCtx(sites.toggleStar));
router.patch('/sites/:domain/meta', wrapCtx(sites.updateMeta));

// User routes
router.get('/users/:username/sites', wrapStrParam(users.getUserSites, 'username'));
router.get('/users/:username/profile-picture', async (req: ExpressReq, res: ExpressRes) => {
  try {
    const webReq = toWebRequest(req);
    const username = (req.params as Record<string, string>)['username'] ?? '';
    const response = await users.getProfilePicture(webReq, username);
    await sendWebResponse(res, response);
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/users/:username/stars', wrapStrParam(users.getUserStars, 'username'));
router.get('/users/:username/:domain', async (req: ExpressReq, res: ExpressRes) => {
  const webReq = toWebRequest(req);
  const authError = await requireAuth(webReq);
  if (authError) { await sendWebResponse(res, authError); return; }
  try {
    const p = req.params as Record<string, string | undefined>;
    const response = await users.getPublicSiteInfo(webReq, p['username'] ?? '', p['domain'] ?? '');
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
    const response = await users.getUserByUsernameEndpoint(webReq, req.path);
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
    const response = await sites.serveStatic(webReq, req.path, { remoteAddr });
    await sendWebResponse(res, response);
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
