import * as sitesDb from '../../core/sites/db.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import type { Result } from '../../shared/errors.ts';


export async function updateSiteMeta(
  sessionId: string,
  domain: string,
  updates: { subdomain?: string | undefined; displayName?: string | undefined },
): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
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

  await sitesDb.writeSiteMetadata(user, domain, data);
  return { ok: true, value: undefined };
}


