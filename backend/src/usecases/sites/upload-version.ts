import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { version } from '../../db/version.ts';
import { versionsDir, versionPath } from '../../shared/paths.ts';
import { validateSession } from '../../shared/session-check.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { toVersionSourceData } from '../../shared/version-source-data.ts';
import { site } from '../../db/site.ts';

import * as fs from 'node:fs/promises';



import type { Result } from '../../shared/errors.ts';


export async function uploadVersion(sessionId: string, domain: string, zipData: Uint8Array): Promise<Result<{ index: number }>> {
  const sessionRecord = await session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;

  // Check if domain exists
  const existingData = await readSiteMetadata(user, domain);
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
  const siteRowId = (await site.upsert(toSiteUpsert(user, domain, data)))?.id;
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    const existingVersion = await version.findFirst({ where: { siteId: siteRowId, index } });
    const sourceData = toVersionSourceData(entry.source);
    if (existingVersion) {
      await version.update({ where: { id: existingVersion.id }, data: { ...sourceData, createdAt: entry.createdAt } });
    } else {
      await version.create({ data: { index, createdAt: entry.createdAt, siteId: siteRowId, ...sourceData } });
    }
  }
  const versionIndices = new Set(Object.keys(data.versions).map(Number));
  await version.deleteMany({ where: { siteId: siteRowId, index: { notIn: Array.from(versionIndices) } } });

  return { ok: true, value: { index } };
}


