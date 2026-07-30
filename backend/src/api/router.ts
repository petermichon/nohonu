import { Router } from 'express';
import { requireSession } from './auth-middleware.ts';
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

// Auth-protected
router.get('/auth/me', requireSession, auth.authMe);
router.post('/auth/logout', requireSession, auth.authLogout);
router.patch('/auth/displayname', requireSession, auth.authDisplayName);
router.post('/auth/profile-picture', requireSession, auth.uploadProfilePicture);
router.delete('/auth/profile-picture/delete', requireSession, auth.deleteProfilePicture);
router.get('/auth/sessions', requireSession, auth.getSessions);
router.delete('/auth/sessions/delete', requireSession, auth.deleteSession);

// Site-protected
router.get('/sites', requireSession, sites.listSites);
router.get('/sites/:domain', requireSession, sites.getSiteInfo);
router.get('/sites/:domain/download', requireSession, sites.downloadSite);
router.get('/sites/:domain/icon', requireSession, sites.getSiteIcon);
router.get('/sites/:domain/cover', requireSession, sites.getSiteCover);
router.get('/sites/:domain/meta', requireSession, sites.getSiteMeta);
router.get('/sites/:domain/stats', requireSession, sites.getSiteStats);
router.get('/sites/:domain/visitors', requireSession, sites.getSiteVisitors);
router.get('/sites/:domain/uptime', requireSession, sites.getSiteUptime);
router.get('/sites/:domain/repos', requireSession, sites.getSiteRepos);
router.get('/sites/:domain/versions', requireSession, versions.listSiteVersions);
router.get('/sites/:domain/versions/download', requireSession, versions.downloadSiteVersion);
router.get('/sites/:domain/custom-domains', requireSession, customDomains.getCustomDomains);
router.get('/sites/:domain/custom-domains/token', requireSession, customDomains.getVerificationToken);
router.post('/sites/:domain', requireSession, sites.createSiteDispatch);
router.post('/sites/:domain/versions', requireSession, versions.upload);
router.post('/sites/:domain/versions/github', requireSession, versions.fetchGithub);
router.post('/sites/:domain/versions/:timestamp/activate', requireSession, versions.activateVersion);
router.post('/sites/:domain/custom-domains', requireSession, customDomains.addCustomDomain);
router.post('/sites/:domain/custom-domains/verify', requireSession, customDomains.verifyCustomDomain);
router.post('/sites/:domain/cover', requireSession, sites.uploadCover);
router.delete('/sites/:domain', requireSession, sites.deleteSite);
router.delete('/sites/:domain/versions/:timestamp', requireSession, versions.deleteVersion);
router.delete('/sites/:domain/custom-domains/:subAction', requireSession, customDomains.deleteCustomDomain);
router.delete('/sites/:domain/cover', requireSession, sites.deleteCover);
router.patch('/sites/:domain/toggle', requireSession, sites.toggleSite);
router.patch('/sites/:domain/star', requireSession, sites.toggleStar);
router.patch('/sites/:domain/meta', requireSession, sites.updateMeta);

// Custom domains
router.get('/custom-domains', requireSession, customDomains.getAllCustomDomains);

// Static file serving - must be last (catch-all)
router.get('/{*path}', sites.serveStatic);
