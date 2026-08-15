import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { extractedDir, versionPath } from '../../shared/paths.ts';
import { fileExists } from '../../shared/node/file-exists.ts';
import { site } from '../../db/site.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import * as fs from 'node:fs/promises';







import type { Result } from '../../shared/errors.ts';


export async function activateVersion(sessionId: string, siteId: string, index: number): Promise<Result<void>> {
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
    return { ok: false, code: 'internal', message: 'Failed to activate version' };
  }
  data.currentIndex = index;
  data.enabled = true;
  data.lastDeployedAt = Date.now();
  await upsertSite(user, siteId, data);
  try {
    await fs.rm(extractedDir(user, siteId), { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete extracted site for ${user}/${siteId}: ${message}`);
  }
  await site.updateMany({ where: { AND: { userUsername: user, siteId } }, data: { extracted: false } });
  return { ok: true, value: undefined };
}


