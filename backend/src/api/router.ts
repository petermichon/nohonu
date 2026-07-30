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

// ── Public ──

router.get('/health', health.health);
router.post('/auth/register', auth.authRegister);
router.post('/auth/login', auth.authLogin);
router.get('/auth', auth.auth);

router.get('/check-domain', check.checkDomain);
router.get('/check-custom-domain', check.checkCustomDomain);
router.get('/check-subdomain', check.checkSubdomain);
router.get('/explore/sites', sites.listExploreSites);
router.get('/users/:username/sites', users.getUserSites);
router.get('/users/:username/profile-picture', users.getProfilePicture);
router.get('/users/:username/stars', users.getUserStars);
router.get('/users/:username/:domain', users.getPublicSiteInfo);
router.get('/users/:username', users.getUserByUsernameEndpoint);
router.get('/{*path}', sites.serveStatic);

// ── Auth-protected ──

const authProtected = Router();
authProtected.use(requireSession);
authProtected.get('/me', auth.authMe);
authProtected.post('/logout', auth.authLogout);
authProtected.patch('/displayname', auth.authDisplayName);
authProtected.post('/profile-picture', auth.uploadProfilePicture);
authProtected.delete('/profile-picture/delete', auth.deleteProfilePicture);
authProtected.get('/sessions', auth.getSessions);
authProtected.delete('/sessions/delete', auth.deleteSession);
router.use('/auth', authProtected);

// ── Site-protected ──

const siteProtected = Router();
siteProtected.use(requireSession);
siteProtected.get('/', sites.listSites);
siteProtected.get('/:domain', sites.getSiteInfo);
siteProtected.get('/:domain/download', sites.downloadSite);
siteProtected.get('/:domain/icon', sites.getSiteIcon);
siteProtected.get('/:domain/cover', sites.getSiteCover);
siteProtected.get('/:domain/meta', sites.getSiteMeta);
siteProtected.get('/:domain/repos', sites.getSiteRepos);
siteProtected.get('/:domain/versions', versions.listSiteVersions);
siteProtected.get('/:domain/versions/download', versions.downloadSiteVersion);
siteProtected.get('/:domain/custom-domains', customDomains.getCustomDomains);
siteProtected.get('/:domain/custom-domains/token', customDomains.getVerificationToken);
siteProtected.post('/:domain', sites.createSiteDispatch);
siteProtected.post('/:domain/versions', versions.upload);
siteProtected.post('/:domain/versions/github', versions.fetchGithub);
siteProtected.post('/:domain/versions/:timestamp/activate', versions.activateVersion);
siteProtected.post('/:domain/custom-domains', customDomains.addCustomDomain);
siteProtected.post('/:domain/custom-domains/verify', customDomains.verifyCustomDomain);
siteProtected.post('/:domain/cover', sites.uploadCover);
siteProtected.delete('/:domain', sites.deleteSite);
siteProtected.delete('/:domain/versions/:timestamp', versions.deleteVersion);
siteProtected.delete('/:domain/custom-domains/:subAction', customDomains.deleteCustomDomain);
siteProtected.delete('/:domain/cover', sites.deleteCover);
siteProtected.patch('/:domain/toggle', sites.toggleSite);
siteProtected.patch('/:domain/star', sites.toggleStar);
siteProtected.patch('/:domain/meta', sites.updateMeta);
router.use('/sites', siteProtected);

// ── Custom domains (need auth) ──

const customDomainsProtected = Router();
customDomainsProtected.use(requireSession);
customDomainsProtected.get('/', customDomains.getAllCustomDomains);
router.use('/custom-domains', customDomainsProtected);
