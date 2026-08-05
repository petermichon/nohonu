import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { session } from '../../db/session.ts';
import { site } from '../../db/site.ts';
import { version } from '../../db/version.ts';
import { fileExists, versionPath } from '../../shared/paths.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { toVersionSourceData } from '../../shared/version-source-data.ts';

import * as fs from 'node:fs/promises';









import type { Result } from '../../shared/errors.ts';


export async function deleteVersion(sessionId: string, domain: string, index: number): Promise<Result<void>> {
  const sessionRecord = await session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await fileExists(versionPath(user, domain, index));
  if (!exists) {
    return { ok: false, code: 'not_found', message: 'Version not found' };
  }
  const record = await site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const data = record ? toSiteData(record) : undefined;
  if (!data) {
    return { ok: false, code: 'internal', message: 'Failed to delete version' };
  }
  try {
    await fs.unlink(versionPath(user, domain, index));
  } catch {
    return { ok: false, code: 'internal', message: 'Failed to delete version' };
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
  const siteRowId = (await site.upsert(toSiteUpsert(user, domain, data)))?.id;
  if (siteRowId) {
    for (const [key, entry] of Object.entries(data.versions)) {
      const idx = parseInt(key, 10);
      const existingVersion = await version.findFirst({ where: { siteId: siteRowId, index: idx } });
      const sourceData = toVersionSourceData(entry.source);
      if (existingVersion) {
        await version.update({ where: { id: existingVersion.id }, data: { ...sourceData, createdAt: entry.createdAt } });
      } else {
        await version.create({ data: { index: idx, createdAt: entry.createdAt, siteId: siteRowId, ...sourceData } });
      }
    }
    const versionIndices = new Set(Object.keys(data.versions).map(Number));
    await version.deleteMany({ where: { siteId: siteRowId, index: { notIn: Array.from(versionIndices) } } });
  }
  return { ok: true, value: undefined };
}
