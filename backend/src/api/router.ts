import { Router } from 'express';
import * as health from './endpoints/health.ts';
import { authRegister } from './endpoints/auth/auth-register.ts';
import { authLogin } from './endpoints/auth/auth-login.ts';
import { authLogout } from './endpoints/auth/auth-logout.ts';
import { authMe } from './endpoints/auth/auth-me.ts';
import { authDisplayName } from './endpoints/auth/auth-display-name.ts';
import { authChangePassword } from './endpoints/auth/auth-change-password.ts';
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

export const router = Router();

router.get('/health', health.health);
router.get('/check-custom-domain', checkCustomDomain);

// Auth
router.post('/auth/register', authRegister);
router.post('/auth/login', authLogin);
router.get('/check-domain', checkDomain);
router.get('/check-subdomain', checkSubdomain);
router.get('/explore/sites', listExploreSites);
router.get('/users/:username/sites', getUserSites);
router.get('/users/:username/profile-picture', getProfilePicture);
router.get('/users/:username/stars', getUserStars);
router.get('/users/:username/sites/:siteId', getPublicSiteInfo);
router.get('/users/:username', getUserByUsernameEndpoint);

// Auth
router.get('/auth/me', authMe);
router.post('/auth/logout', authLogout);
router.patch('/auth/displayname', authDisplayName);
router.patch('/auth/password', authChangePassword);
router.post('/auth/profile-picture', uploadProfilePicture);
router.delete('/auth/profile-picture/delete', deleteProfilePicture);
router.get('/auth/sessions', getSessions);
router.delete('/auth/sessions/delete', deleteSession);

// Sites
router.get('/sites', listSites);
router.get('/users/:username/sites/:siteId', getSiteInfo);
router.get('/users/:username/sites/:siteId/download', downloadSite);
router.get('/users/:username/sites/:siteId/icon', getSiteIcon);
router.get('/users/:username/sites/:siteId/cover', getSiteCover);
router.get('/users/:username/sites/:siteId/meta', getSiteMeta);
router.get('/users/:username/sites/:siteId/stats', getSiteStats);
router.get('/users/:username/sites/:siteId/visitors', getSiteVisitors);
router.get('/users/:username/sites/:siteId/uptime', getSiteUptime);
router.get('/users/:username/sites/:siteId/repos', getSiteRepos);
router.get('/users/:username/sites/:siteId/versions', listSiteVersions);
router.get('/users/:username/sites/:siteId/versions/:timestamp/download', downloadSiteVersion);
router.get('/users/:username/sites/:siteId/custom-domains', getCustomDomains);
router.get('/users/:username/sites/:siteId/custom-domains/token', getVerificationToken);
router.post('/users/:username/sites/:siteId', createSiteRaw);
router.post('/users/:username/sites/:siteId/github', createSiteFromGithub);
router.post('/users/:username/sites/:siteId/versions', upload);
router.post('/users/:username/sites/:siteId/versions/github', fetchGithub);
router.post('/users/:username/sites/:siteId/versions/:timestamp/activate', activateVersion);
router.post('/users/:username/sites/:siteId/custom-domains', addCustomDomain);
router.post('/users/:username/sites/:siteId/custom-domains/:subAction/verify', verifyCustomDomain);
router.post('/users/:username/sites/:siteId/cover', uploadCover);
router.delete('/users/:username/sites/:siteId', deleteSite);
router.delete('/users/:username/sites/:siteId/versions/:timestamp', deleteVersion);
router.delete('/users/:username/sites/:siteId/custom-domains/:subAction', deleteCustomDomain);
router.delete('/users/:username/sites/:siteId/cover', deleteCover);
router.patch('/users/:username/sites/:siteId/toggle', toggleSite);
router.patch('/users/:username/sites/:siteId/star', toggleStar);
router.patch('/users/:username/sites/:siteId/meta', updateMeta);

// Custom domains
router.get('/custom-domains', getAllCustomDomains);

// Static file serving - must be last (catch-all)
router.get('/{*path}', serveStatic);
