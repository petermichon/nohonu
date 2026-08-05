import { db } from '../../db.ts';
import { versionPath } from '../../shared/paths.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { upsertSite } from './upsert-site.ts';
import { toVersionSourceData } from '../../shared/version-source-data.ts';

import * as fs from 'node:fs/promises';




export async function deleteVersionFile(user: string, domain: string, index: number): Promise<boolean> {
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const data = record ? toSiteData(record) : undefined;
  if (data === undefined) {
    console.error(`deleteVersionFile: site not found: ${user}/${domain}`);
    return false;
  }

  try {
    await fs.unlink(versionPath(user, domain, index));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`deleteVersionFile: failed to delete version file for ${user}/${domain}@${index}: ${message}`);
    return false;
  }

  delete data.versions[index];
  if (data.currentIndex === index) {
    const versionIndices = Object.keys(data.versions)
      .map(Number)
      .sort((a, b) => {
        return b - a;
      });
    data.currentIndex = versionIndices.length > 0 ? (versionIndices[0] as number) : null;
  }
  const siteRowId = await upsertSite(user, domain, data);
  if (siteRowId) {
    for (const [key, entry] of Object.entries(data.versions)) {
      const index = parseInt(key, 10);
      const existingVersion = await db.version.findFirst({ where: { siteId: siteRowId, index } });
      const sourceData = toVersionSourceData(entry.source);
      if (existingVersion) {
        await db.version.update({ where: { id: existingVersion.id }, data: { ...sourceData, createdAt: entry.createdAt } });
      } else {
        await db.version.create({ data: { index, createdAt: entry.createdAt, siteId: siteRowId, ...sourceData } });
      }
    }
    const versionIndices = new Set(Object.keys(data.versions).map(Number));
    await db.version.deleteMany({ where: { siteId: siteRowId, index: { notIn: Array.from(versionIndices) } } });
  }
  return true;
}
