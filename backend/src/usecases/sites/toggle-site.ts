import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { invalidateExtractedSite } from '../../core/sites/invalidate-extracted-site.ts';
import { session } from '../../db/session.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import type { Result } from '../../shared/errors.ts';


export async function toggleSite(sessionId: string, siteId: string): Promise<Result<{ enabled: boolean }>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await readSiteMetadata(user, siteId);
  if (!data || data.currentIndex === null) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  data.enabled = !data.enabled;
  const siteRowId = await upsertSite(user, siteId, data);
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }

  if (!data.enabled) {
    await invalidateExtractedSite(user, siteId);
  }

  const result = { enabled: data.enabled };
  return { ok: true, value: result };
}


