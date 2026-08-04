import * as storage from '../../core/sites/storage.ts';
import * as fsOps from '../../core/sites/fs.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import type { Result } from '../../shared/errors.ts';


export async function deleteVersion(sessionId: string, domain: string, index: number): Promise<Result<void>> {
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
  const deleted = await storage.deleteVersionFile(user, domain, index);
  if (!deleted) {
    return { ok: false, code: 'internal', message: 'Failed to delete version' };
  }
  return { ok: true, value: undefined };
}


