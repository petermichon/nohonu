import { Router } from 'express';
import { wrap } from './wrap.ts';
import { wrapCtx } from './wrap-ctx.ts';
import { wrapStrParam } from './wrap-str-param.ts';
import { API_KEY } from './api-key.ts';
import * as health from './endpoints/health.ts';
import * as auth from './endpoints/auth.ts';
import * as check from './endpoints/check.ts';
import * as customDomains from './endpoints/custom-domains.ts';
import * as sites from './endpoints/sites.ts';
import * as versions from './endpoints/versions.ts';
import * as users from './endpoints/users.ts';

export const router = Router();

if (API_KEY) {
  router.use((req, res, next) => {
    if (req.headers['x-api-key'] === API_KEY) return next();
    res.status(401).json({ error: 'Unauthorized' });
  });
}

// Health
router.get('/health', wrap(health.health));

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
router.post('/sites/:domain', wrapCtx(sites.createSiteDispatch));
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
router.get('/users/:username/profile-picture', wrapStrParam(users.getProfilePicture, 'username'));
router.get('/users/:username/stars', wrapStrParam(users.getUserStars, 'username'));
router.get('/users/:username/:domain', wrapCtx(users.getPublicSiteInfo));
router.get('/users/:username', wrapStrParam(users.getUserByUsernameEndpoint, 'username'));

// Static file serving - must be last (catch-all)
router.get('/{*path}', wrapStrParam(sites.serveStatic, 'path'));
