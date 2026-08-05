import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import { validateSession } from '../../shared/session-check.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { site } from '../../db/site.ts';

import type { Result } from '../../shared/errors.ts';


export async function updateSiteMeta(
  sessionId: string,
  domain: string,
  updates: { subdomain?: string | undefined; displayName?: string | undefined },
): Promise<Result<void>> {
  const sessionRecord = await session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
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

  const siteRowId = (await site.upsert(toSiteUpsert(user, domain, data)))?.id;
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  return { ok: true, value: undefined };
}


