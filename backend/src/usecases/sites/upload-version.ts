import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { db } from '../../db.ts';
import { versionsDir, versionPath } from '../../shared/paths.ts';
import { validateSession } from '../../shared/session-check.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { toVersionSourceData } from '../../shared/version-source-data.ts';

import * as fs from 'node:fs/promises';



import type { Result } from '../../shared/errors.ts';


export async function uploadVersion(sessionId: string, domain: string, zipData: Uint8Array): Promise<Result<{ index: number }>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;

  // Check if domain exists
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const existingData = record ? toSiteData(record) : undefined;
  if (!existingData) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  const data = existingData;
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();

  await fs.mkdir(versionsDir(user, domain), { recursive: true });
  await fs.writeFile(versionPath(user, domain, index), zipData);
  const siteRowId = (await db.site.upsert(toSiteUpsert(user, domain, data)))?.id;
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
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

  return { ok: true, value: { index } };
}


