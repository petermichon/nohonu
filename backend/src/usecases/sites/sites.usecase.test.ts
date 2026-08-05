import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as dns from 'node:dns/promises';
import * as fs from 'node:fs/promises';
import type { Mock } from 'vitest';

import {
  listStarredSites,
  makeStoredZip,
  me,
  registerUser,
  resetTestState,
  sites,
} from '../../test/setup.ts';

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

vi.mock('node:dns/promises', () => ({
  resolveTxt: vi.fn(),
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

function zip(files: Record<string, string> = { 'index.html': '<h1>hi</h1>' }): Uint8Array {
  const entries: Record<string, Uint8Array> = {};
  for (const [name, content] of Object.entries(files)) {
    entries[name] = new TextEncoder().encode(content);
  }
  return makeStoredZip(entries);
}

async function username(sessionId: string): Promise<string> {
  const result = await me(sessionId);
  if (!result.user) throw new Error('me failed: ' + (result.error ?? 'unknown'));
  return result.user.username;
}

async function makeSite(username: string, domain: string): Promise<string> {
  const sessionId = await registerUser(username);
  const result = await sites.createSite(sessionId, domain, zip());
  if (!result.ok) throw new Error(`createSite failed: ${result.message}`);
  return sessionId;
}

async function verificationToken(domain: string): Promise<string> {
  const data = new TextEncoder().encode(domain);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `nohonu-verify-${hashHex.substring(0, 16)}`;
}

beforeEach(async () => {
  await resetTestState();
  fetchMock.mockReset();
});

describe('createSite', () => {
  it('creates a site owned by the session user', async () => {
    const sessionId = await makeSite('alice', 'mysite');
    const user = await username(sessionId);

    const result = await sites.createSite(sessionId, 'mysite', zip());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('already_exists');

    const list = await sites.listMySites(sessionId);
    expect(list.ok).toBe(true);
    if (list.ok) expect(list.value.some((s) => s.domain === 'mysite')).toBe(true);

    const info = await sites.getSiteInfo(user, 'mysite');
    expect(info?.enabled).toBe(true);
  });

  it('rejects an invalid session', async () => {
    const result = await sites.createSite('not-a-session', 'mysite', zip());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('unauthorized');
  });
});

describe('versions', () => {
  it('uploads versions and lists them with current pointing at the latest', async () => {
    const sessionId = await makeSite('bob', 'mysite');

    const uploaded = await sites.uploadVersion(sessionId, 'mysite', zip({ 'index.html': '<h1>v2</h1>' }));
    expect(uploaded.ok).toBe(true);

    const list = await sites.listVersions('mysite');
    expect(list.versions.length).toBe(2);
    expect(list.current).toBe(2);
  });

  it('returns not_found when uploading to a missing site', async () => {
    const sessionId = await registerUser('bob');
    const result = await sites.uploadVersion(sessionId, 'missing', zip());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('not_found');
  });

  it('activates a specific version', async () => {
    const sessionId = await makeSite('carol', 'mysite');
    await sites.uploadVersion(sessionId, 'mysite', zip({ 'index.html': '<h1>v2</h1>' }));

    const result = await sites.activateVersion(sessionId, 'mysite', 1);
    expect(result.ok).toBe(true);
    expect((await sites.listVersions('mysite')).current).toBe(1);
  });

  it('deletes a version and falls back to the highest remaining', async () => {
    const sessionId = await makeSite('dave', 'mysite');
    await sites.uploadVersion(sessionId, 'mysite', zip({ 'index.html': '<h1>v2</h1>' }));

    const result = await sites.deleteVersion(sessionId, 'mysite', 2);
    expect(result.ok).toBe(true);

    const list = await sites.listVersions('mysite');
    expect(list.versions.map((v) => v.index)).toEqual([1]);
    expect(list.current).toBe(1);
  });

  it('downloads a version zip', async () => {
    const sessionId = await makeSite('erin', 'mysite');
    const result = await sites.downloadVersion(sessionId, 'mysite', 1);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value?.data.length).toBeGreaterThan(0);
  });

  it('returns null when downloading a missing version', async () => {
    const sessionId = await makeSite('erin', 'mysite');
    const result = await sites.downloadVersion(sessionId, 'mysite', 99);
    expect(result.ok && result.value).toBeNull();
  });
});

describe('toggleSite', () => {
  it('disables and re-enables a site', async () => {
    const sessionId = await makeSite('frank', 'mysite');
    const user = await username(sessionId);

    const off = await sites.toggleSite(sessionId, 'mysite');
    expect(off.ok && off.value.enabled).toBe(false);
    expect((await sites.getSiteInfo(user, 'mysite'))?.enabled).toBe(false);

    const on = await sites.toggleSite(sessionId, 'mysite');
    expect(on.ok && on.value.enabled).toBe(true);
  });
});

describe('toggleStar', () => {
  it('stars and unstars a site', async () => {
    const ownerSession = await makeSite('grace', 'mysite');
    const owner = await username(ownerSession);
    const fanSession = await registerUser('fan');

    const star = await sites.toggleStar(fanSession, 'mysite', true);
    expect(star.ok).toBe(true);
    if (star.ok) expect(star.value.starCount).toBe(1);

    const info = await sites.getSiteInfo(owner, 'mysite');
    const starred = await listStarredSites(await username(fanSession));
    expect(starred.some((s) => s.domain === 'mysite')).toBe(true);
    expect(info?.siteId).toBeTruthy();

    const unstar = await sites.toggleStar(fanSession, 'mysite', false);
    expect(unstar.ok && unstar.value.starCount).toBe(0);
  });

  it('returns not_found for a missing site', async () => {
    const sessionId = await registerUser('fan');
    const result = await sites.toggleStar(sessionId, 'missing', true);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('not_found');
  });
});

describe('updateSiteMeta', () => {
  it('updates subdomain and display name', async () => {
    const sessionId = await makeSite('heidi', 'mysite');
    const user = await username(sessionId);

    const result = await sites.updateSiteMeta(sessionId, 'mysite', { subdomain: 'newsub', displayName: 'My Site' });
    expect(result.ok).toBe(true);

    const info = await sites.getSiteInfo(user, 'mysite');
    expect(info?.subdomain).toBe('newsub');
    expect(info?.displayName).toBe('My Site');
  });

  it('rejects an invalid subdomain', async () => {
    const sessionId = await makeSite('heidi', 'mysite');
    const result = await sites.updateSiteMeta(sessionId, 'mysite', { subdomain: 'UPPER' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid');
  });

  it('returns not_found for a missing site', async () => {
    const sessionId = await registerUser('heidi');
    const result = await sites.updateSiteMeta(sessionId, 'missing', { subdomain: 'newsub' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('not_found');
  });
});

describe('custom domains', () => {
  it('adds, lists and removes a custom domain', async () => {
    const sessionId = await makeSite('ivan', 'mysite');

    const add = await sites.addCustomDomain(sessionId, 'mysite', 'example.com');
    expect(add.ok).toBe(true);

    const list = await sites.getCustomDomains(sessionId, 'mysite');
    expect(list.ok && list.value).toEqual([{ domain: 'example.com', verified: false }]);

    const all = await sites.getAllCustomDomains();
    expect(all.some((d) => d.customDomain === 'example.com')).toBe(true);

    const remove = await sites.removeCustomDomain(sessionId, 'mysite', 'example.com');
    expect(remove.ok).toBe(true);
    const after = await sites.getCustomDomains(sessionId, 'mysite');
    expect(after.ok && after.value).toEqual([]);
  });

  it('rejects duplicate custom domains', async () => {
    const sessionId = await makeSite('ivan', 'mysite');
    await sites.addCustomDomain(sessionId, 'mysite', 'example.com');
    const dup = await sites.addCustomDomain(sessionId, 'mysite', 'example.com');
    expect(dup.ok).toBe(false);
    if (!dup.ok) expect(dup.code).toBe('already_exists');
  });

  it('verifies a custom domain against DNS', async () => {
    const sessionId = await makeSite('judy', 'mysite');
    await sites.addCustomDomain(sessionId, 'mysite', 'example.com');

    const token = await verificationToken('mysite');
    (dns.resolveTxt as Mock).mockResolvedValue([[token]]);
    const ok = await sites.verifyCustomDomain(sessionId, 'mysite', 'example.com');
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.verified).toBe(true);

    (dns.resolveTxt as Mock).mockResolvedValue([['other-token']]);
    const bad = await sites.verifyCustomDomain(sessionId, 'mysite', 'example.com');
    expect(bad.ok && bad.value.verified).toBe(false);
  });

  it('returns a deterministic verification token', async () => {
    const sessionId = await makeSite('judy', 'mysite');
    const token = await sites.getVerificationToken('mysite');
    expect(token.token).toMatch(/^nohonu-verify-[0-9a-f]{16}$/);
    expect(token.token).toBe(await verificationToken('mysite'));
    expect(sessionId).toBeTruthy();
  });
});

describe('cover image', () => {
  it('uploads, reads and deletes a cover', async () => {
    const sessionId = await makeSite('karl', 'mysite');
    const data = new Uint8Array([9, 8, 7]);

    const upload = await sites.uploadSiteCover(sessionId, 'mysite', data);
    expect(upload.ok).toBe(true);
    const cover = await sites.getSiteCover('mysite');
    expect(Array.from(cover ?? [])).toEqual([9, 8, 7]);

    const del = await sites.deleteSiteCover(sessionId, 'mysite');
    expect(del.ok).toBe(true);
    expect(await sites.getSiteCover('mysite')).toBeNull();
  });
});

describe('serving', () => {
  it('serves an extracted file from the active version', async () => {
    const sessionId = await makeSite('lisa', 'mysite');
    const user = await username(sessionId);

    const served = await sites.serveSiteFile(user, 'mysite', '/index.html');
    expect(served).not.toBeNull();
    expect(new TextDecoder().decode(served?.data)).toBe('<h1>hi</h1>');
    expect(served?.contentType).toBe('text/html');
  });

  it('returns null for a disabled site', async () => {
    const sessionId = await makeSite('lisa', 'mysite');
    const user = await username(sessionId);
    await sites.toggleSite(sessionId, 'mysite');

    expect(await sites.serveSiteFile(user, 'mysite', '/index.html')).toBeNull();
  });

  it('resolves a subdomain host and a path-based request', async () => {
    const sessionId = await makeSite('mike', 'mysite');
    const user = await username(sessionId);
    await sites.updateSiteMeta(sessionId, 'mysite', { subdomain: 'my-app' });

    const viaSubdomain = await sites.resolveDomainAndServe('my-app.localhost', '/');
    expect(viaSubdomain).toEqual({ user, domain: 'mysite', filePath: '/index.html' });

    const viaPath = await sites.resolveDomainAndServe('localhost', '/mysite/page');
    expect(viaPath).toEqual({ user, domain: 'mysite', filePath: '/page' });
  });

  it('does not let a malicious zip escape the site directory', async () => {
    const sessionId = await registerUser('traversal');
    const user = await username(sessionId);
    const body = zip({
      'index.html': '<h1>ok</h1>',
      '../../evil.txt': 'pwned',
      '/abs.txt': 'abs',
    });
    const created = await sites.createSite(sessionId, 'mysite', body);
    expect(created.ok).toBe(true);

    const served = await sites.serveSiteFile(user, 'mysite', '/index.html');
    expect(new TextDecoder().decode(served?.data)).toBe('<h1>ok</h1>');

    const sitesDir = process.env['SITES_DIR'] ?? '';
    expect(await pathExists(`${sitesDir}/evil.txt`)).toBe(false);
    expect(await pathExists(`${sitesDir}/abs.txt`)).toBe(false);
  });

  it('serves a request end to end and records the page hit', async () => {
    const sessionId = await makeSite('hugo', 'mysite');
    const user = await username(sessionId);
    await sites.updateSiteMeta(sessionId, 'mysite', { subdomain: 'my-app' });

    const before = sites.getSiteStats('mysite', 10080).reduce((sum, p) => sum + p.count, 0);
    const served = await sites.serveRequest('my-app.localhost', '/index.html', '1.2.3.4');
    expect(served).not.toBeNull();
    expect(new TextDecoder().decode(served?.data)).toBe('<h1>hi</h1>');
    const after = sites.getSiteStats('mysite', 10080).reduce((sum, p) => sum + p.count, 0);
    expect(after).toBe(before + 1);
    expect(user).toBeTruthy();
  });

  it('returns null when the request cannot be resolved', async () => {
    await makeSite('ivan', 'mysite');
    expect(await sites.serveRequest('unknown.example.com', '/', '1.2.3.4')).toBeNull();
  });
});

describe('analytics', () => {
  it('records hits and exposes stats and visitors', async () => {
    await makeSite('nina', 'mysite');

    sites.recordPageHit('mysite', '1.2.3.4');
    sites.recordPageHit('mysite', '1.2.3.4');

    const totalHits = sites.getSiteStats('mysite', 10080).reduce((sum, p) => sum + p.count, 0);
    expect(totalHits).toBe(2);

    const stats = sites.getSiteStats('mysite', 60);
    const lastSlot = stats[stats.length - 1];
    expect(lastSlot?.count).toBe(2);

    const visitors = sites.getSiteVisitors('mysite');
    expect(visitors).toEqual([{ ip: '1.2.3.4', count: 2, last: expect.any(Number) }]);
  });

  it('reports uptime percentage in the site listing', async () => {
    const sessionId = await makeSite('oscar', 'mysite');
    sites.recordUptime('mysite', true);

    const list = await sites.listMySites(sessionId);
    expect(list.ok).toBe(true);
    if (list.ok) expect(list.value[0]?.uptime).toBe(100);
  });

  it('caps the number of tracked visitors', async () => {
    await makeSite('pat', 'mysite');

    for (let i = 0; i < 501; i += 1) {
      sites.recordPageHit('mysite', `ip-${i}`);
    }

    const visitors = sites.getSiteVisitors('mysite');
    expect(visitors.length).toBeLessThanOrEqual(500);
  });

  it('groups uptime slots', async () => {
    await makeSite('ray', 'mysite');
    sites.recordUptime('mysite', true);

    const grouped = sites.getSiteUptime('mysite', 60, 5);
    expect(grouped[grouped.length - 1]?.up).toBe(true);
    expect(grouped.length).toBeLessThanOrEqual(13);
  });

  it('persists analytics to disk', async () => {
    const sessionId = await makeSite('olivia', 'mysite');
    const user = await username(sessionId);
    sites.recordPageHit('mysite', '1.2.3.4');
    await expect(sites.saveAnalytics(user, 'mysite')).resolves.toBeUndefined();
  });

  it('round-trips analytics through persistence', async () => {
    const sessionId = await makeSite('quinn', 'mysite');
    const user = await username(sessionId);
    sites.recordPageHit('mysite', '1.2.3.4');
    sites.recordUptime('mysite', true);

    await sites.saveAnalytics(user, 'mysite');
    sites.resetAnalytics();

    await sites.loadAnalytics(user, 'mysite');

    const totalHits = sites.getSiteStats('mysite', 10080).reduce((sum, p) => sum + p.count, 0);
    expect(totalHits).toBe(1);

    const uptime = sites.getSiteUptime('mysite', 5);
    expect(uptime[uptime.length - 1]?.up).toBe(true);

    const visitors = sites.getSiteVisitors('mysite');
    expect(visitors.some((v) => v.ip === '1.2.3.4')).toBe(true);
  });
});

describe('check helpers', () => {
  it('checks existence of sites, subdomains and owners', async () => {
    const sessionId = await makeSite('oscar', 'mysite');
    const user = await username(sessionId);

    expect(await sites.checkSite(user, 'mysite')).toEqual({ exists: true, enabled: true });
    expect(await sites.checkDomain(user, 'mysite')).toBe(true);
    expect(await sites.checkSubdomain('no-such-subdomain')).toBe(false);
    expect(sessionId).toBeTruthy();
  });

  it('returns null for the icon when the site has no favicon', async () => {
    const sessionId = await makeSite('oscar', 'mysite');
    expect(await sites.getSiteIcon('mysite')).toBeNull();
  });
});

describe('github deploys', () => {
  it('creates a site from a github archive', async () => {
    const sessionId = await registerUser('paul');
    const user = await username(sessionId);
    const body = zip({ 'repo-main/index.html': '<h1>from github</h1>' });
    fetchMock.mockResolvedValue(new Response(body, { status: 200 }));

    const result = await sites.createSiteFromGithub(sessionId, 'ghsite', 'owner/repo', 'main');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.repo).toBe('owner/repo');

    const served = await sites.serveSiteFile(user, 'ghsite', '/index.html');
    expect(new TextDecoder().decode(served?.data)).toBe('<h1>from github</h1>');

    const repos = await sites.getSiteRepos(sessionId, 'ghsite');
    expect(repos.ok && repos.value?.history[0]?.repo).toBe('owner/repo');
  });

  it('returns not_found when the repo does not exist', async () => {
    const sessionId = await registerUser('paul');
    fetchMock.mockResolvedValue(new Response('Not Found', { status: 404 }));

    const result = await sites.createSiteFromGithub(sessionId, 'ghsite', 'owner/missing', 'main');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('not_found');
  });

  it('uploads a new version from github', async () => {
    const sessionId = await makeSite('quinn', 'mysite');
    const body = zip({ 'repo-main/index.html': '<h1>v2 via github</h1>' });
    fetchMock.mockResolvedValue(new Response(body, { status: 200 }));

    const result = await sites.uploadVersionFromGithub(sessionId, 'mysite', 'owner/repo', 'main');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.index).toBe(2);
  });

  it('returns not_found when uploading github version to a missing site', async () => {
    const sessionId = await registerUser('quinn');
    fetchMock.mockResolvedValue(new Response('Not Found', { status: 404 }));

    const result = await sites.uploadVersionFromGithub(sessionId, 'missing', 'owner/repo', 'main');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('not_found');
  });

  it('returns already_exists when the domain is taken', async () => {
    const sessionId = await makeSite('quinn', 'ghsite');
    fetchMock.mockResolvedValue(new Response(zip(), { status: 200 }));

    const result = await sites.createSiteFromGithub(sessionId, 'ghsite', 'owner/repo', 'main');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('already_exists');
  });
});

describe('deleteSite', () => {
  it('removes the site, its files and analytics', async () => {
    const sessionId = await makeSite('ryan', 'mysite');
    const user = await username(sessionId);
    sites.recordPageHit('mysite', '1.2.3.4');

    const deleted = await sites.deleteSite(sessionId, 'mysite');
    expect(deleted.ok).toBe(true);

    expect(await sites.checkSite(user, 'mysite')).toEqual({ exists: false, enabled: false });
    const list = await sites.listMySites(sessionId);
    expect(list.ok && list.value.some((s) => s.domain === 'mysite')).toBe(false);
    const totalHits = sites.getSiteStats('mysite', 10080).reduce((sum, p) => sum + p.count, 0);
    expect(totalHits).toBe(0);
    expect(user).toBeTruthy();
  });
});

describe('listAllSites', () => {
  it('lists sites across all users', async () => {
    await makeSite('u1', 'site1');
    await makeSite('u2', 'site2');

    const all = await sites.listAllSites();
    expect(all.map((s) => s.domain).sort()).toEqual(['site1', 'site2']);

    const filtered = await sites.listAllSites('u1');
    const site1 = filtered.find((s) => s.domain === 'site1');
    expect(site1?.isStarred).toBe(false);
  });
});

describe('downloadActiveVersion', () => {
  it('downloads the active version zip', async () => {
    const sessionId = await makeSite('sarah', 'mysite');

    const result = await sites.downloadActiveVersion('mysite');
    expect(result?.filename).toBe('mysite.zip');
    expect(result?.data.length).toBeGreaterThan(0);
  });

  it('returns null for a disabled site', async () => {
    const sessionId = await makeSite('sarah', 'mysite');
    await sites.toggleSite(sessionId, 'mysite');

    expect(await sites.downloadActiveVersion('mysite')).toBeNull();
  });
});

describe('getSiteMeta and getMySiteInfo', () => {
  it('returns the subdomain', async () => {
    const sessionId = await makeSite('tina', 'mysite');
    const meta = await sites.getSiteMeta(sessionId, 'mysite');
    expect(meta.ok && meta.value?.subdomain).toBe('tina-mysite');

    const info = await sites.getMySiteInfo(sessionId, 'mysite');
    expect(info.ok && info.value?.siteId).toBe('tina-mysite');
  });

  it('returns null for a missing site', async () => {
    const sessionId = await registerUser('tina');
    const meta = await sites.getSiteMeta(sessionId, 'missing');
    expect(meta.ok && meta.value).toBeNull();
  });
});

describe('getSiteIcon', () => {
  it('finds a favicon.ico in the archive', async () => {
    const sessionId = await registerUser('uma');
    const body = zip({ 'index.html': '<h1>hi</h1>', 'favicon.ico': 'ico' });
    const created = await sites.createSite(sessionId, 'mysite', body);
    expect(created.ok).toBe(true);

    const icon = await sites.getSiteIcon('mysite');
    expect(icon?.contentType).toBe('image/x-icon');
    expect(new TextDecoder().decode(icon?.data)).toBe('ico');
  });
});

describe('uptime and grouped stats', () => {
  it('returns uptime slots and grouped stats', async () => {
    await makeSite('victor', 'mysite');
    sites.recordUptime('mysite', true);
    sites.recordPageHit('mysite', '1.2.3.4');

    const uptime = sites.getSiteUptime('mysite', 5);
    expect(uptime[uptime.length - 1]?.up).toBe(true);
    expect(sites.getSiteUptime('mysite', 5)[0]?.up).toBeUndefined();

    const grouped = sites.getSiteStats('mysite', 60, 5);
    expect(grouped.length).toBeLessThanOrEqual(13);
    expect(grouped.reduce((sum, p) => sum + p.count, 0)).toBe(1);
  });
});

describe('account-filtered custom domains and subdomains', () => {
  it('filters custom domains by account and checks subdomains', async () => {
    const sessionId = await makeSite('wendy', 'mysite');
    const user = await username(sessionId);
    await sites.addCustomDomain(sessionId, 'mysite', 'example.com');
    await sites.updateSiteMeta(sessionId, 'mysite', { subdomain: 'my-app' });

    expect(await sites.checkSubdomain('my-app')).toBe(true);
    expect(await sites.checkSubdomain('missing')).toBe(false);

    const mine = await sites.getAllCustomDomains(user);
    expect(mine.some((d) => d.customDomain === 'example.com')).toBe(true);
    expect(await sites.getAllCustomDomains('someone-else')).toEqual([]);
  });
});

describe('error paths', () => {
  it('returns not_found for missing sites across operations', async () => {
    const sessionId = await registerUser('xavier');

    expect((await sites.toggleSite(sessionId, 'missing')).ok).toBe(false);
    expect((await sites.addCustomDomain(sessionId, 'missing', 'example.com')).ok).toBe(false);
    expect((await sites.removeCustomDomain(sessionId, 'missing', 'example.com')).ok).toBe(false);
    expect((await sites.verifyCustomDomain(sessionId, 'missing', 'example.com')).ok).toBe(false);
    expect((await sites.uploadSiteCover(sessionId, 'missing', new Uint8Array([1]))).ok).toBe(false);
    expect((await sites.deleteSiteCover(sessionId, 'missing')).ok).toBe(false);
    expect((await sites.activateVersion(sessionId, 'missing', 1)).ok).toBe(false);
    expect((await sites.deleteVersion(sessionId, 'missing', 1)).ok).toBe(false);
  });

  it('returns not_found for missing versions', async () => {
    const sessionId = await makeSite('xavier', 'mysite');
    expect((await sites.activateVersion(sessionId, 'mysite', 99)).ok).toBe(false);
    expect((await sites.deleteVersion(sessionId, 'mysite', 99)).ok).toBe(false);
  });

  it('returns empty results for a missing site', async () => {
    const sessionId = await registerUser('xavier');
    const user = await username(sessionId);

    expect(await sites.serveSiteFile(user, 'missing', '/index.html')).toBeNull();
    expect(await sites.listVersions('missing')).toEqual({ versions: [], current: null });
    expect(sessionId).toBeTruthy();
  });

  it('treats a failed DNS lookup as unverified', async () => {
    const sessionId = await makeSite('yolanda', 'mysite');
    await sites.addCustomDomain(sessionId, 'mysite', 'example.com');

    (dns.resolveTxt as Mock).mockRejectedValue(new Error('ENOTFOUND'));
    const result = await sites.verifyCustomDomain(sessionId, 'mysite', 'example.com');
    expect(result.ok && result.value.verified).toBe(false);
  });

  it('routes a verified custom domain to its site', async () => {
    const sessionId = await makeSite('zane', 'mysite');
    const user = await username(sessionId);
    await sites.addCustomDomain(sessionId, 'mysite', 'example.com');

    const token = await verificationToken('mysite');
    (dns.resolveTxt as Mock).mockResolvedValue([[token]]);
    await sites.verifyCustomDomain(sessionId, 'mysite', 'example.com');

    const resolved = await sites.resolveDomainAndServe('example.com', '/');
    expect(resolved).toEqual({ user, domain: 'mysite', filePath: '/index.html' });
  });
});

