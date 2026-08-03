import * as fs from 'node:fs/promises';
import * as sitesDb from '../../core/sites/db.ts';
import * as storage from '../../core/sites/storage.ts';
import * as fsOps from '../../core/sites/fs.ts';
import * as paths from '../../core/sites/paths.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import type { Result } from '../../shared/errors.ts';
import type { VersionInfo, VersionSource } from './types.ts';

export async function listVersions(user: string, domain: string): Promise<{ versions: VersionInfo[]; current: number | null }> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) return { versions: [], current: null };

  const versions: VersionInfo[] = [];

  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    try {
      const stat = await fs.stat(paths.versionPath(user, domain, index));
      const source: VersionSource = entry.source.type === 'github'
        ? { type: 'github', repo: entry.source.repo, branch: entry.source.branch }
        : { type: 'upload' };
      versions.push({ index, size: stat.size, source, createdAt: entry.createdAt });
    } catch {
      // file missing, skip
    }
  }

  versions.sort((a, b) => {
    return b.index - a.index;
  });
  return { versions, current: data.currentIndex };
}

export async function downloadVersion(
  sessionId: string,
  domain: string,
  index: number,
): Promise<Result<{ data: Uint8Array; filename: string } | null>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  if (!(await fsOps.versionExists(user, domain, index))) return { ok: true, value: null };
  const data = await fsOps.readVersion(user, domain, index);
  return { ok: true, value: { data, filename: `${domain}-${index}.zip` } };
}

export async function activateVersion(sessionId: string, domain: string, index: number): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await fsOps.versionExists(user, domain, index);
  if (!exists) {
    return { ok: false, code: 'not_found', message: 'Version not found' };
  }
  const activated = await storage.setCurrentVersion(user, domain, index);
  if (!activated) {
    return { ok: false, code: 'internal', message: 'Failed to activate version' };
  }
  // Update lastDeployedAt
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (data) {
    data.lastDeployedAt = Date.now();
    await sitesDb.writeSiteMetadata(user, domain, data);
  }
  await storage.deleteExtractedFiles(user, domain);
  return { ok: true, value: undefined };
}

export async function deleteVersion(sessionId: string, domain: string, index: number): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await fsOps.versionExists(user, domain, index);
  if (!exists) {
    return { ok: false, code: 'not_found', message: 'Version not found' };
  }
  const deleted = await storage.deleteVersionFile(user, domain, index);
  if (!deleted) {
    return { ok: false, code: 'internal', message: 'Failed to delete version' };
  }
  return { ok: true, value: undefined };
}
