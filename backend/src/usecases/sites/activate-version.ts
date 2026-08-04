import * as sitesDb from '../../core/sites/db.ts';
import * as storage from '../../core/sites/storage.ts';
import * as fsOps from '../../core/sites/fs.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import type { Result } from '../../shared/errors.ts';


export async function activateVersion(sessionId: string, domain: string, index: number): Promise<Result<void>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await fsOps.versionExists(user, domain, index);
  if (!exists) {
    return { ok: false, code: 'not_found', message: 'Version not found' };
  }
  const activated = await storage.setCurrentVersion(user, domain, index);
  if (!activated) {
    return { ok: false, code: 'internal', message: 'Failed to activate version' };
  }
  // Update lastDeployedAt
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (data) {
    data.lastDeployedAt = Date.now();
    await sitesDb.writeSiteMetadata(user, domain, data);
  }
  await storage.deleteExtractedFiles(user, domain);
  return { ok: true, value: undefined };
}


