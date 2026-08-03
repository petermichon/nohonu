import * as sitesDb from '../../core/sites/db.ts';
import * as storage from '../../core/sites/storage.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import type { Result } from '../../shared/errors.ts';


export async function toggleSite(sessionId: string, domain: string): Promise<Result<{ enabled: boolean }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
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


