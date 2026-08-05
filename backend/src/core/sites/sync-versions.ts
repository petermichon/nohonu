import { version } from '../../db/version.ts';
import type { VersionEntry } from '../../shared/paths.ts';
import { toVersionSourceData } from '../../shared/sites/version-source-data.ts';

export async function syncVersions(siteId: string, versions: Record<string, VersionEntry>): Promise<void> {
  for (const [key, entry] of Object.entries(versions)) {
    const index = parseInt(key, 10);
    const existingVersion = await version.findFirst({ where: { siteId, index } });
    const sourceData = toVersionSourceData(entry.source);
    if (existingVersion) {
      await version.update({ where: { id: existingVersion.id }, data: { ...sourceData, createdAt: entry.createdAt } });
    } else {
      await version.create({ data: { index, createdAt: entry.createdAt, siteId, ...sourceData } });
    }
  }
  const versionIndices = new Set(Object.keys(versions).map(Number));
  await version.deleteMany({ where: { siteId, index: { notIn: Array.from(versionIndices) } } });
}
