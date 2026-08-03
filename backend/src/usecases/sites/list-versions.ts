import * as fs from 'node:fs/promises';
import * as sitesDb from '../../core/sites/db.ts';
import { findUserForDomain } from '../../core/sites/find-user-for-domain.ts';
import * as paths from '../../core/sites/paths.ts';
import type { VersionInfo, VersionSource } from './types.ts';


export async function listVersions(domain: string): Promise<{ versions: VersionInfo[]; current: number | null }> {
  const user = await findUserForDomain(domain);
  if (!user) return { versions: [], current: null };

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
