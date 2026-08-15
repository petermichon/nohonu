import { versionPath } from '../../shared/paths.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { site as siteTable } from '../../db/site.ts';
import { siteWhere } from '../../shared/site-where.ts';

import * as fs from 'node:fs/promises';

import type { VersionInfo } from '../../shared/version-info.ts';
import type { VersionSource } from '../../shared/paths.ts';


export async function listVersions(user: string, siteId: string): Promise<{ versions: VersionInfo[]; current: number | null }> {
  const site = await siteTable.findUnique({ where: siteWhere(user, siteId), select: { userUsername: true } });
  const siteUser = site?.userUsername ?? null;
  if (!siteUser) return { versions: [], current: null };

  const data = await readSiteMetadata(user, siteId);
  if (!data) return { versions: [], current: null };

  const versions: VersionInfo[] = [];

  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    try {
      const stat = await fs.stat(versionPath(user, siteId, index));
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
