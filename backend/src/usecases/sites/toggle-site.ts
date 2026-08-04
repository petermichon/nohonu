import * as sitesDb from '../../core/sites/db.ts';
import * as storage from '../../core/sites/storage.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import type { Result } from '../../shared/errors.ts';


export async function toggleSite(sessionId: string, domain: string): Promise<Result<{ enabled: boolean }>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  data.enabled = !data.enabled;
  await sitesDb.writeSiteMetadata(user, domain, data);

  if (!data.enabled) await storage.deleteExtractedFiles(user, domain);

  const result = { enabled: data.enabled };
  return { ok: true, value: result };
}


