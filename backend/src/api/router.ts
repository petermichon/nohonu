import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import * as health from './endpoints/health.ts';
import * as auth from './endpoints/auth.ts';
import * as check from './endpoints/check.ts';
import { listSites } from './endpoints/sites/list-sites.ts';
import { listExploreSites } from './endpoints/sites/list-explore-sites.ts';
import { getSiteInfo } from './endpoints/sites/get-site-info.ts';
import { downloadSite } from './endpoints/sites/download-site.ts';
import { getSiteIcon } from './endpoints/sites/get-site-icon.ts';
import { getSiteCover } from './endpoints/sites/get-site-cover.ts';
import { getSiteMeta } from './endpoints/sites/get-site-meta.ts';
import { getSiteStats } from './endpoints/sites/get-site-stats.ts';
import { getSiteVisitors } from './endpoints/sites/get-site-visitors.ts';
import { getSiteUptime } from './endpoints/sites/get-site-uptime.ts';
import { getSiteRepos } from './endpoints/sites/get-site-repos.ts';
import { createSiteRaw } from './endpoints/sites/create-site-raw.ts';
import { createSiteFromGithub } from './endpoints/sites/create-site-from-github.ts';
import { deleteSite } from './endpoints/sites/delete-site.ts';
import { toggleSite } from './endpoints/sites/toggle-site.ts';
import { toggleStar } from './endpoints/sites/toggle-star.ts';
import { updateMeta } from './endpoints/sites/update-meta.ts';
import { uploadCover } from './endpoints/sites/upload-cover.ts';
import { deleteCover } from './endpoints/sites/delete-cover.ts';
import { serveStatic } from './endpoints/sites/serve-static.ts';
import { getAllCustomDomains } from './endpoints/custom-domains/get-all-custom-domains.ts';
import { getCustomDomains } from './endpoints/custom-domains/get-custom-domains.ts';
import { getVerificationToken } from './endpoints/custom-domains/get-verification-token.ts';
import { addCustomDomain } from './endpoints/custom-domains/add-custom-domain.ts';
import { verifyCustomDomain } from './endpoints/custom-domains/verify-custom-domain.ts';
import { deleteCustomDomain } from './endpoints/custom-domains/delete-custom-domain.ts';
import * as versions from './endpoints/versions.ts';
import * as users from './endpoints/users.ts';
import { API_KEY } from '../config.ts';

export const router = Router();

function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  if (req.headers['x-api-key'] === API_KEY) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

if (API_KEY) {
  // Protect only the management API; public endpoints and static file
  // serving stay open.
  router.use('/auth/me', requireApiKey);
  router.use('/auth/logout', requireApiKey);
  router.use('/auth/displayname', requireApiKey);
  router.use('/auth/profile-picture', requireApiKey);
  router.use('/auth/sessions', requireApiKey);
  router.use('/sites', requireApiKey);
  router.use('/custom-domains', requireApiKey);
}

// Public
router.get('/health', health.health);
router.get('/auth', auth.auth);
router.post('/auth/register', auth.authRegister);
router.post('/auth/login', auth.authLogin);
router.get('/check-domain', check.checkDomain);
router.get('/check-custom-domain', check.checkCustomDomain);
router.get('/check-subdomain', check.checkSubdomain);
router.get('/explore/sites', listExploreSites);
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
router.get('/sites', listSites);
router.get('/sites/:domain', getSiteInfo);
router.get('/sites/:domain/download', downloadSite);
router.get('/sites/:domain/icon', getSiteIcon);
router.get('/sites/:domain/cover', getSiteCover);
router.get('/sites/:domain/meta', getSiteMeta);
router.get('/sites/:domain/stats', getSiteStats);
router.get('/sites/:domain/visitors', getSiteVisitors);
router.get('/sites/:domain/uptime', getSiteUptime);
router.get('/sites/:domain/repos', getSiteRepos);
router.get('/sites/:domain/versions', versions.listSiteVersions);
router.get('/sites/:domain/versions/:timestamp/download', versions.downloadSiteVersion);
router.get('/sites/:domain/custom-domains', getCustomDomains);
router.get('/sites/:domain/custom-domains/token', getVerificationToken);
router.post('/sites/:domain', createSiteRaw);
router.post('/sites/:domain/github', createSiteFromGithub);
router.post('/sites/:domain/versions', versions.upload);
router.post('/sites/:domain/versions/github', versions.fetchGithub);
router.post('/sites/:domain/versions/:timestamp/activate', versions.activateVersion);
router.post('/sites/:domain/custom-domains', addCustomDomain);
router.post('/sites/:domain/custom-domains/:subAction/verify', verifyCustomDomain);
router.post('/sites/:domain/cover', uploadCover);
router.delete('/sites/:domain', deleteSite);
router.delete('/sites/:domain/versions/:timestamp', versions.deleteVersion);
router.delete('/sites/:domain/custom-domains/:subAction', deleteCustomDomain);
router.delete('/sites/:domain/cover', deleteCover);
router.patch('/sites/:domain/toggle', toggleSite);
router.patch('/sites/:domain/star', toggleStar);
router.patch('/sites/:domain/meta', updateMeta);

// Custom domains
router.get('/custom-domains', getAllCustomDomains);

// Static file serving - must be last (catch-all)
router.get('/{*path}', serveStatic);
