import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import type { Result } from '../../shared/errors.ts';


export async function getSiteMeta(sessionId: string, domain: string): Promise<Result<{ subdomain?: string } | null>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const data = record ? toSiteData(record) : undefined;
  if (!data) {
    return { ok: true, value: null };
  }
  return { ok: true, value: { subdomain: data.subdomain } };
}


