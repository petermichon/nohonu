import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import { site } from '../../db/site.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import type { Result } from '../../shared/errors.ts';


export async function updateSiteMeta(
  sessionId: string,
  domain: string,
  updates: { subdomain?: string | undefined; displayName?: string | undefined },
): Promise<Result<void>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  if (updates.subdomain !== undefined) {
    if (!VALID_DOMAIN.test(updates.subdomain)) {
      return { ok: false, code: 'invalid', message: 'Invalid subdomain' };
    }
    data.subdomain = updates.subdomain;
  }

  if (updates.displayName !== undefined) {
    data.displayName = updates.displayName || undefined;
  }

  const siteRowId = await upsertSite(user, domain, data);
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  return { ok: true, value: undefined };
}


