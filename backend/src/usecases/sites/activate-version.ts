import * as fs from 'node:fs/promises';
import { setCurrentVersion } from '../../core/sites/set-current-version.ts';
import { deleteExtractedFiles } from '../../core/sites/delete-extracted-files.ts';
import { writeSiteMetadata } from '../../core/sites/write-site-metadata.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { versionPath } from '../../shared/paths.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import type { Result } from '../../shared/errors.ts';


export async function activateVersion(sessionId: string, domain: string, index: number): Promise<Result<void>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await fs.stat(versionPath(user, domain, index)).then(() => true).catch(() => false);
  if (!exists) {
    return { ok: false, code: 'not_found', message: 'Version not found' };
  }
  const activated = await setCurrentVersion(user, domain, index);
  if (!activated) {
    return { ok: false, code: 'internal', message: 'Failed to activate version' };
  }
  // Update lastDeployedAt
  const data = await readSiteMetadata(user, domain);
  if (data) {
    data.lastDeployedAt = Date.now();
    await writeSiteMetadata(user, domain, data);
  }
  await deleteExtractedFiles(user, domain);
  return { ok: true, value: undefined };
}


