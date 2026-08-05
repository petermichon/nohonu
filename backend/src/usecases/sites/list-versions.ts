import { versionPath } from '../../shared/paths.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { site as siteTable } from '../../db/site.ts';

import * as fs from 'node:fs/promises';

import type { VersionInfo } from '../../shared/sites/version-info.ts';
import type { VersionSource } from '../../shared/paths.ts';


export async function listVersions(domain: string): Promise<{ versions: VersionInfo[]; current: number | null }> {
  const site = await siteTable.findFirst({ where: { domain }, select: { userUsername: true } });
  const user = site?.userUsername ?? null;
  if (!user) return { versions: [], current: null };

  const data = await readSiteMetadata(user, domain);
  if (!data) return { versions: [], current: null };

  const versions: VersionInfo[] = [];

  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    try {
      const stat = await fs.stat(versionPath(user, domain, index));
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
