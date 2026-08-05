import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { writeSiteMetadata } from '../../core/sites/write-site-metadata.ts';
import { db } from '../../db.ts';
import { versionsDir, versionPath } from '../../shared/paths.ts';
import { validateSession } from '../../shared/session-check.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import * as fs from 'node:fs/promises';



import type { Result } from '../../shared/errors.ts';


export async function uploadVersion(sessionId: string, domain: string, zipData: Uint8Array): Promise<Result<{ index: number }>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;

  // Check if domain exists
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
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
  await writeSiteMetadata(user, domain, data);

  return { ok: true, value: { index } };
}


