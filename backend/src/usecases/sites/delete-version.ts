import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { versionPath } from '../../shared/paths.ts';
import { fileExists } from '../../shared/node/file-exists.ts';
import { site } from '../../db/site.ts';
import { syncVersions } from '../../core/sites/sync-versions.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import * as fs from 'node:fs/promises';









import type { Result } from '../../shared/errors.ts';


export async function deleteVersion(sessionId: string, siteId: string, index: number): Promise<Result<void>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  console.assert(typeof siteId === 'string' && siteId.length > 0, 'siteId must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await fileExists(versionPath(user, siteId, index));
  if (!exists) {
    return { ok: false, code: 'not_found', message: 'Version not found' };
  }
  const data = await readSiteMetadata(user, siteId);
  if (!data) {
    return { ok: false, code: 'internal', message: 'Failed to delete version' };
  }
  try {
    await fs.unlink(versionPath(user, siteId, index));
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
  const siteRowId = await upsertSite(user, siteId, data);
  if (siteRowId) {
    await syncVersions(siteRowId, data.versions);
  }
  return { ok: true, value: undefined };
}
