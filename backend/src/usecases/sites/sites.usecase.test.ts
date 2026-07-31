import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as dns from 'node:dns/promises';
import type { Mock } from 'vitest';
import {
  makeStoredZip,
  me,
  metrics,
  registerUser,
  resetTestState,
  sites,
} from '../../test/setup.ts';

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
    expect(list.some((s) => s.domain === 'mysite')).toBe(true);

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
    const user = await username(sessionId);

    const uploaded = await sites.uploadVersion(sessionId, 'mysite', zip({ 'index.html': '<h1>v2</h1>' }));
    expect(uploaded.ok).toBe(true);

    const list = await sites.listVersions(user, 'mysite');
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
    const user = await username(sessionId);
    await sites.uploadVersion(sessionId, 'mysite', zip({ 'index.html': '<h1>v2</h1>' }));

    const result = await sites.activateVersion(sessionId, 'mysite', 1);
    expect(result.ok).toBe(true);
    expect((await sites.listVersions(user, 'mysite')).current).toBe(1);
  });

  it('deletes a version and falls back to the highest remaining', async () => {
    const sessionId = await makeSite('dave', 'mysite');
    const user = await username(sessionId);
    await sites.uploadVersion(sessionId, 'mysite', zip({ 'index.html': '<h1>v2</h1>' }));

    const result = await sites.deleteVersion(sessionId, 'mysite', 2);
    expect(result.ok).toBe(true);

    const list = await sites.listVersions(user, 'mysite');
    expect(list.versions.map((v) => v.index)).toEqual([1]);
    expect(list.current).toBe(1);
  });

  it('downloads a version zip', async () => {
    const sessionId = await makeSite('erin', 'mysite');
    const result = await sites.downloadVersion(sessionId, 'mysite', 1);
    expect(result).not.toBeNull();
    expect(result?.data.length).toBeGreaterThan(0);
  });

  it('returns null when downloading a missing version', async () => {
    const sessionId = await makeSite('erin', 'mysite');
    const result = await sites.downloadVersion(sessionId, 'mysite', 99);
    expect(result).toBeNull();
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
    const starred = await sites.listStarredSites(await username(fanSession));
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
    expect(list).toEqual([{ domain: 'example.com', verified: false }]);

    const all = await sites.getAllCustomDomains();
    expect(all.some((d) => d.customDomain === 'example.com')).toBe(true);

    const remove = await sites.removeCustomDomain(sessionId, 'mysite', 'example.com');
    expect(remove.ok).toBe(true);
    expect(await sites.getCustomDomains(sessionId, 'mysite')).toEqual([]);
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
    const user = await username(sessionId);
    const data = new Uint8Array([9, 8, 7]);

    const upload = await sites.uploadSiteCover(sessionId, 'mysite', data);
    expect(upload.ok).toBe(true);
    const cover = await sites.getSiteCover(user, 'mysite');
    expect(Array.from(cover ?? [])).toEqual([9, 8, 7]);

    const del = await sites.deleteSiteCover(sessionId, 'mysite');
    expect(del.ok).toBe(true);
    expect(await sites.getSiteCover(user, 'mysite')).toBeNull();
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
});

describe('analytics', () => {
  it('records hits and exposes stats and visitors', async () => {
    await makeSite('nina', 'mysite');

    sites.recordPageHit('mysite', '1.2.3.4');
    sites.recordPageHit('mysite', '1.2.3.4');

    expect(metrics.getTotalHits('mysite')).toBe(2);

    const stats = sites.getSiteStats('mysite', 60);
    const lastSlot = stats[stats.length - 1];
    expect(lastSlot?.count).toBe(2);

    const visitors = sites.getSiteVisitors('mysite');
    expect(visitors).toEqual([{ ip: '1.2.3.4', count: 2, last: expect.any(Number) }]);
  });
});

describe('check helpers', () => {
  it('checks existence of sites, subdomains and owners', async () => {
    const sessionId = await makeSite('oscar', 'mysite');
    const user = await username(sessionId);

    expect(await sites.checkSite(user, 'mysite')).toEqual({ exists: true, enabled: true });
    expect(await sites.checkDomain(user, 'mysite')).toBe(true);
    expect(await sites.findUserForDomain('mysite')).toBe(user);
    expect(await sites.findUserForDomain('missing')).toBeNull();
    expect(await sites.checkSubdomain('no-such-subdomain')).toBe(false);
    expect(sessionId).toBeTruthy();
  });

  it('returns null for the icon when the site has no favicon', async () => {
    const sessionId = await makeSite('oscar', 'mysite');
    const user = await username(sessionId);
    expect(await sites.getSiteIcon(user, 'mysite')).toBeNull();
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
    expect(repos?.history[0]?.repo).toBe('owner/repo');
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
});
