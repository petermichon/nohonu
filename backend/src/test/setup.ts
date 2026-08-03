import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

const TEMP_BASE = await fs.mkdtemp(path.join(os.tmpdir(), 'nohonu_test_'));
const SITES_TEST_DIR = path.join(TEMP_BASE, 'sites');
const TEST_DB = path.join(TEMP_BASE, 'test.db');

process.env['SITES_DIR'] = SITES_TEST_DIR;
process.env['DATABASE_URL'] = `file:${TEST_DB}`;
process.env['API_KEY'] = 'test-api-key';
await fs.mkdir(SITES_TEST_DIR, { recursive: true });

// Push schema to the test database before any app module reads env vars.
const backendDir = path.resolve(import.meta.dirname ?? process.cwd(), '../..');
execSync(`npx prisma migrate deploy`, {
  cwd: backendDir,
  stdio: 'pipe',
  env: { ...process.env, DATABASE_URL: `file:${TEST_DB}` },
});

// App modules must be imported dynamically, after DATABASE_URL/SITES_DIR are set.
export const register = (await import('../usecases/auth/register.ts')).register;
export const login = (await import('../usecases/auth/login.ts')).login;
export const logout = (await import('../usecases/auth/logout.ts')).logout;
export const logoutAll = (await import('../usecases/auth/logout-all.ts')).logoutAll;
export const me = (await import('../usecases/auth/me.ts')).me;
export const updateDisplayName = (await import('../usecases/auth/update-display-name.ts')).updateDisplayName;
export const uploadProfilePicture = (await import('../usecases/auth/upload-profile-picture.ts')).uploadProfilePicture;
export const deleteProfilePicture = (await import('../usecases/auth/delete-profile-picture.ts')).deleteProfilePicture;
export const getPublicUser = (await import('../usecases/auth/get-public-user.ts')).getPublicUser;
export const getProfilePictureFile = (await import('../usecases/auth/get-profile-picture-file.ts'))
  .getProfilePictureFile;
export const listSessions = (await import('../usecases/auth/list-sessions.ts')).listSessions;
export const deleteSession = (await import('../usecases/auth/delete-session.ts')).deleteSession;
export const cleanupExpiredSessions = (await import('../usecases/auth/cleanup-expired-sessions.ts'))
  .cleanupExpiredSessions;
export const checkAuth = (await import('../usecases/apikey/check-auth.ts')).checkAuth;

export const sites = {
  ...(await import('../usecases/sites/activate-version.ts')),
  ...(await import('../usecases/sites/add-custom-domain.ts')),
  ...(await import('../usecases/sites/check-custom-domain.ts')),
  ...(await import('../usecases/sites/check-domain.ts')),
  ...(await import('../usecases/sites/check-site.ts')),
  ...(await import('../usecases/sites/check-subdomain.ts')),
  ...(await import('../usecases/sites/create-site-from-github.ts')),
  ...(await import('../usecases/sites/create-site.ts')),
  ...(await import('../usecases/sites/delete-site-cover.ts')),
  ...(await import('../usecases/sites/delete-site.ts')),
  ...(await import('../usecases/sites/delete-version.ts')),
  ...(await import('../usecases/sites/download-active-version.ts')),
  ...(await import('../usecases/sites/download-version.ts')),
  ...(await import('../usecases/sites/get-all-custom-domains.ts')),
  ...(await import('../usecases/sites/get-custom-domains.ts')),
  ...(await import('../usecases/sites/get-my-site-info.ts')),
  ...(await import('../usecases/sites/get-site-cover.ts')),
  ...(await import('../usecases/sites/get-site-icon.ts')),
  ...(await import('../usecases/sites/get-site-info.ts')),
  ...(await import('../usecases/sites/get-site-meta.ts')),
  ...(await import('../usecases/sites/get-site-repos.ts')),
  ...(await import('../usecases/sites/get-site-stats.ts')),
  ...(await import('../usecases/sites/get-site-uptime.ts')),
  ...(await import('../usecases/sites/get-site-visitors.ts')),
  ...(await import('../usecases/sites/get-verification-token.ts')),
  ...(await import('../usecases/sites/list-all-sites.ts')),
  ...(await import('../usecases/sites/list-my-sites.ts')),
  ...(await import('../usecases/sites/list-sites.ts')),
  ...(await import('../usecases/sites/list-versions.ts')),
  ...(await import('../usecases/sites/load-analytics.ts')),
  ...(await import('../usecases/sites/record-page-hit.ts')),
  ...(await import('../usecases/sites/record-uptime.ts')),
  ...(await import('../usecases/sites/remove-custom-domain.ts')),
  ...(await import('../usecases/sites/reset-analytics.ts')),
  ...(await import('../usecases/sites/reset-database.ts')),
  ...(await import('../usecases/sites/resolve-domain-and-serve.ts')),
  ...(await import('../usecases/sites/save-analytics.ts')),
  ...(await import('../usecases/sites/serve-site-file.ts')),
  ...(await import('../usecases/sites/toggle-site.ts')),
  ...(await import('../usecases/sites/toggle-star.ts')),
  ...(await import('../usecases/sites/update-site-meta.ts')),
  ...(await import('../usecases/sites/upload-site-cover.ts')),
  ...(await import('../usecases/sites/upload-version-from-github.ts')),
  ...(await import('../usecases/sites/upload-version.ts')),
  ...(await import('../usecases/sites/verify-custom-domain.ts')),
};
export const listStarredSites = (await import('../usecases/sites/list-starred-sites.ts')).listStarredSites;
export const health = await import('../usecases/health/index.ts');

export async function resetTestState(): Promise<void> {
  await sites.resetDatabase();
}

export async function registerUser(username = `user_${crypto.randomUUID().slice(0, 8)}`): Promise<string> {
  const result = await register('password123', username);
  if (!result.success || !result.session) {
    throw new Error(`registerUser failed: ${result.error ?? 'unknown'}`);
  }
  return result.session;
}

// Minimal stored (uncompressed) zip, one entry per file.
export function makeStoredZip(files: Record<string, Uint8Array>): Uint8Array {
  const encoder = new TextEncoder();
  const fileCount = Object.keys(files).length;

  const localParts: Uint8Array[] = [];
  const cdParts: Uint8Array[] = [];
  let offset = 0;

  for (const [filename, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(filename);
    const nameLen = nameBytes.length;
    const dataLen = content.length;

    const localHeader = new Uint8Array(30 + nameLen + dataLen);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(26, nameLen, true);
    lv.setUint32(18, dataLen, true);
    lv.setUint32(22, dataLen, true);
    localHeader.set(nameBytes, 30);
    localHeader.set(content, 30 + nameLen);
    localParts.push(localHeader);

    const cdEntry = new Uint8Array(46 + nameLen);
    const cv = new DataView(cdEntry.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint32(20, dataLen, true);
    cv.setUint32(24, dataLen, true);
    cv.setUint32(42, offset, true);
    cv.setUint16(28, nameLen, true);
    cdEntry.set(nameBytes, 46);
    cdParts.push(cdEntry);

    offset += localHeader.length;
  }

  const localLength = localParts.reduce((sum, p) => sum + p.length, 0);
  const cdLength = cdParts.reduce((sum, p) => sum + p.length, 0);

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, fileCount, true);
  ev.setUint16(10, fileCount, true);
  ev.setUint32(12, cdLength, true);
  ev.setUint32(16, localLength, true);

  const out = new Uint8Array(localLength + cdLength + eocd.length);
  let pos = 0;
  for (const part of localParts) {
    out.set(part, pos);
    pos += part.length;
  }
  for (const part of cdParts) {
    out.set(part, pos);
    pos += part.length;
  }
  out.set(eocd, pos);
  return out;
}
