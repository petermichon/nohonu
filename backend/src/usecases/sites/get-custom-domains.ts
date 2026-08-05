import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import type { Result } from '../../shared/errors.ts';
import type { CustomDomain } from '../../shared/custom-domain.ts';


export async function getCustomDomains(sessionId: string, domain: string): Promise<Result<CustomDomain[]>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const data = record ? toSiteData(record) : undefined;
  if (!data) return { ok: true, value: [] };
  const customDomains = data.customDomains ?? [];
  return { ok: true, value: customDomains.map(({ domain: d, verified }) => ({ domain: d, verified })) };
}

