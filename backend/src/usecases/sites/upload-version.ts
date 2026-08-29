import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { invalidateExtractedSite } from '../../core/sites/invalidate-extracted-site.ts';
import { versionsDir, versionPath } from '../../shared/paths.ts';
import { syncVersions } from '../../core/sites/sync-versions.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import * as fs from 'node:fs/promises';



import type { Result } from '../../shared/errors.ts';


export async function uploadVersion(sessionId: string, siteId: string, zipData: Uint8Array): Promise<Result<{ index: number }>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;

  // Check if siteId exists
  const existingData = await readSiteMetadata(user, siteId);
  if (!existingData) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  const data = existingData;
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();

  await fs.mkdir(versionsDir(user, siteId), { recursive: true });
  await fs.writeFile(versionPath(user, siteId, index), zipData);
  await invalidateExtractedSite(user, siteId);
  const siteRowId = await upsertSite(user, siteId, data);
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  await syncVersions(siteRowId, data.versions);

  return { ok: true, value: { index } };
}


