import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import type { Result } from '../../shared/errors.ts';


export async function getSiteMeta(sessionId: string, siteId: string): Promise<Result<{ subdomain?: string } | null>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await readSiteMetadata(user, siteId);
  if (!data) {
    return { ok: true, value: null };
  }
  return { ok: true, value: { subdomain: data.subdomain } };
}


