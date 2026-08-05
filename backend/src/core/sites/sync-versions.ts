import { db } from '../../db.ts';
import type { VersionEntry } from '../../shared/paths.ts';

export async function syncVersions(siteId: string, versions: Record<string, VersionEntry>): Promise<void> {
  for (const [key, entry] of Object.entries(versions)) {
    const index = parseInt(key, 10);
    const existingVersion = await db.version.findFirst({ where: { siteId, index } });
    const sourceData: { type: string; repo: string | null; branch: string | null } = {
      type: entry.source.type,
      repo: null,
      branch: null,
    };
    if (entry.source.type === 'github') {
      sourceData.repo = entry.source.repo;
      sourceData.branch = entry.source.branch;
    }
    if (existingVersion) {
      await db.version.update({ where: { id: existingVersion.id }, data: { ...sourceData, createdAt: entry.createdAt } });
    } else {
      await db.version.create({ data: { index, createdAt: entry.createdAt, siteId, ...sourceData } });
    }
  }

  const versionIndices = new Set(Object.keys(versions).map(Number));
  await db.version.deleteMany({ where: { siteId, index: { notIn: Array.from(versionIndices) } } });
}
