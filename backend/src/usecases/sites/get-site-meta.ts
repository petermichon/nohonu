import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { validateSession } from '../../shared/session-check.ts';

import type { Result } from '../../shared/errors.ts';


export async function getSiteMeta(sessionId: string, domain: string): Promise<Result<{ subdomain?: string } | null>> {
  const sessionRecord = await session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await readSiteMetadata(user, domain);
  if (!data) {
    return { ok: true, value: null };
  }
  return { ok: true, value: { subdomain: data.subdomain } };
}


