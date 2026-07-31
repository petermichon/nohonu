import { Router } from 'express';
import * as health from './endpoints/health.ts';
import * as auth from './endpoints/auth.ts';
import * as check from './endpoints/check.ts';
import * as customDomains from './endpoints/custom-domains.ts';
import * as sites from './endpoints/sites.ts';
import * as versions from './endpoints/versions.ts';
import * as users from './endpoints/users.ts';

export const router = Router();

const API_KEY = process.env['API_KEY'];

if (API_KEY) {
  router.use((req, res, next) => {
    if (req.headers['x-api-key'] === API_KEY) return next();
    res.status(401).json({ error: 'Unauthorized' });
  });
}

// Public
router.get('/health', health.health);
router.get('/auth', auth.auth);
router.post('/auth/register', auth.authRegister);
router.post('/auth/login', auth.authLogin);
router.get('/check-domain', check.checkDomain);
router.get('/check-custom-domain', check.checkCustomDomain);
router.get('/check-subdomain', check.checkSubdomain);
router.get('/explore/sites', sites.listExploreSites);
router.get('/users/:username/sites', users.getUserSites);
router.get('/users/:username/profile-picture', users.getProfilePicture);
router.get('/users/:username/stars', users.getUserStars);
router.get('/users/:username/:domain', users.getPublicSiteInfo);
router.get('/users/:username', users.getUserByUsernameEndpoint);

// Auth
router.get('/auth/me', auth.authMe);
router.post('/auth/logout', auth.authLogout);
router.patch('/auth/displayname', auth.authDisplayName);
router.post('/auth/profile-picture', auth.uploadProfilePicture);
router.delete('/auth/profile-picture/delete', auth.deleteProfilePicture);
router.get('/auth/sessions', auth.getSessions);
router.delete('/auth/sessions/delete', auth.deleteSession);

// Sites
router.get('/sites', sites.listSites);
router.get('/sites/:domain', sites.getSiteInfo);
router.get('/sites/:domain/download', sites.downloadSite);
router.get('/sites/:domain/icon', sites.getSiteIcon);
router.get('/sites/:domain/cover', sites.getSiteCover);
router.get('/sites/:domain/meta', sites.getSiteMeta);
router.get('/sites/:domain/stats', sites.getSiteStats);
router.get('/sites/:domain/visitors', sites.getSiteVisitors);
router.get('/sites/:domain/uptime', sites.getSiteUptime);
router.get('/sites/:domain/repos', sites.getSiteRepos);
router.get('/sites/:domain/versions', versions.listSiteVersions);
router.get('/sites/:domain/versions/:timestamp/download', versions.downloadSiteVersion);
router.get('/sites/:domain/custom-domains', customDomains.getCustomDomains);
router.get('/sites/:domain/custom-domains/token', customDomains.getVerificationToken);
router.post('/sites/:domain', sites.createSiteDispatch);
router.post('/sites/:domain/versions', versions.upload);
router.post('/sites/:domain/versions/github', versions.fetchGithub);
router.post('/sites/:domain/versions/:timestamp/activate', versions.activateVersion);
router.post('/sites/:domain/custom-domains', customDomains.addCustomDomain);
router.post('/sites/:domain/custom-domains/verify', customDomains.verifyCustomDomain);
router.post('/sites/:domain/cover', sites.uploadCover);
router.delete('/sites/:domain', sites.deleteSite);
router.delete('/sites/:domain/versions/:timestamp', versions.deleteVersion);
router.delete('/sites/:domain/custom-domains/:subAction', customDomains.deleteCustomDomain);
router.delete('/sites/:domain/cover', sites.deleteCover);
router.patch('/sites/:domain/toggle', sites.toggleSite);
router.patch('/sites/:domain/star', sites.toggleStar);
router.patch('/sites/:domain/meta', sites.updateMeta);

// Custom domains
router.get('/custom-domains', customDomains.getAllCustomDomains);

// Static file serving - must be last (catch-all)
router.get('/{*path}', sites.serveStatic);
