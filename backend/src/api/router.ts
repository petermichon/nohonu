import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import * as health from './endpoints/health.ts';
import { auth } from './endpoints/auth/auth.ts';
import { authRegister } from './endpoints/auth/auth-register.ts';
import { authLogin } from './endpoints/auth/auth-login.ts';
import { authLogout } from './endpoints/auth/auth-logout.ts';
import { authMe } from './endpoints/auth/auth-me.ts';
import { authDisplayName } from './endpoints/auth/auth-display-name.ts';
import { uploadProfilePicture } from './endpoints/auth/upload-profile-picture.ts';
import { deleteProfilePicture } from './endpoints/auth/delete-profile-picture.ts';
import { getSessions } from './endpoints/auth/get-sessions.ts';
import { deleteSession } from './endpoints/auth/delete-session.ts';
import { checkDomain } from './endpoints/check/check-domain.ts';
import { checkCustomDomain } from './endpoints/check/check-custom-domain.ts';
import { checkSubdomain } from './endpoints/check/check-subdomain.ts';
import { getUserByUsernameEndpoint } from './endpoints/users/get-user-by-username.ts';
import { getPublicSiteInfo } from './endpoints/users/get-public-site-info.ts';
import { getUserSites } from './endpoints/users/get-user-sites.ts';
import { getUserStars } from './endpoints/users/get-user-stars.ts';
import { getProfilePicture } from './endpoints/users/get-profile-picture.ts';
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
import { listSiteVersions } from './endpoints/versions/list-site-versions.ts';
import { upload } from './endpoints/versions/upload.ts';
import { fetchGithub } from './endpoints/versions/fetch-github.ts';
import { downloadSiteVersion } from './endpoints/versions/download-site-version.ts';
import { activateVersion } from './endpoints/versions/activate-version.ts';
import { deleteVersion } from './endpoints/versions/delete-version.ts';
import { getAllCustomDomains } from './endpoints/custom-domains/get-all-custom-domains.ts';
import { getCustomDomains } from './endpoints/custom-domains/get-custom-domains.ts';
import { getVerificationToken } from './endpoints/custom-domains/get-verification-token.ts';
import { addCustomDomain } from './endpoints/custom-domains/add-custom-domain.ts';
import { verifyCustomDomain } from './endpoints/custom-domains/verify-custom-domain.ts';
import { deleteCustomDomain } from './endpoints/custom-domains/delete-custom-domain.ts';
import { requireApiKey } from './require-api-key.ts';
import { API_KEY } from '../config.ts';

export const router = Router();

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
router.get('/auth', auth);
router.post('/auth/register', authRegister);
router.post('/auth/login', authLogin);
router.get('/check-domain', checkDomain);
router.get('/check-custom-domain', checkCustomDomain);
router.get('/check-subdomain', checkSubdomain);
router.get('/explore/sites', listExploreSites);
router.get('/users/:username/sites', getUserSites);
router.get('/users/:username/profile-picture', getProfilePicture);
router.get('/users/:username/stars', getUserStars);
router.get('/users/:username/:domain', getPublicSiteInfo);
router.get('/users/:username', getUserByUsernameEndpoint);

// Auth
router.get('/auth/me', authMe);
router.post('/auth/logout', authLogout);
router.patch('/auth/displayname', authDisplayName);
router.post('/auth/profile-picture', uploadProfilePicture);
router.delete('/auth/profile-picture/delete', deleteProfilePicture);
router.get('/auth/sessions', getSessions);
router.delete('/auth/sessions/delete', deleteSession);

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
router.get('/sites/:domain/versions', listSiteVersions);
router.get('/sites/:domain/versions/:timestamp/download', downloadSiteVersion);
router.get('/sites/:domain/custom-domains', getCustomDomains);
router.get('/sites/:domain/custom-domains/token', getVerificationToken);
router.post('/sites/:domain', createSiteRaw);
router.post('/sites/:domain/github', createSiteFromGithub);
router.post('/sites/:domain/versions', upload);
router.post('/sites/:domain/versions/github', fetchGithub);
router.post('/sites/:domain/versions/:timestamp/activate', activateVersion);
router.post('/sites/:domain/custom-domains', addCustomDomain);
router.post('/sites/:domain/custom-domains/:subAction/verify', verifyCustomDomain);
router.post('/sites/:domain/cover', uploadCover);
router.delete('/sites/:domain', deleteSite);
router.delete('/sites/:domain/versions/:timestamp', deleteVersion);
router.delete('/sites/:domain/custom-domains/:subAction', deleteCustomDomain);
router.delete('/sites/:domain/cover', deleteCover);
router.patch('/sites/:domain/toggle', toggleSite);
router.patch('/sites/:domain/star', toggleStar);
router.patch('/sites/:domain/meta', updateMeta);

// Custom domains
router.get('/custom-domains', getAllCustomDomains);

// Static file serving - must be last (catch-all)
router.get('/{*path}', serveStatic);
