import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { invalidateCustomDomainCache } from '../../core/sites/custom-domains-cache.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import type { Result } from '../../shared/errors.ts';



export async function addCustomDomain(sessionId: string, domain: string, customDomain: string): Promise<Result<void>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const data = record ? toSiteData(record) : undefined;
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  if (!data.customDomains) {
    data.customDomains = [];
  }

  // Check for duplicate
  if (data.customDomains.some((entry) => {
    return entry.domain === customDomain;
  })) {
    return { ok: false, code: 'already_exists', message: 'Custom domain already exists' };
  }

  data.customDomains.push({ domain: customDomain, verified: false });
  const siteId = await upsertSite(user, domain, data);
  if (!siteId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  await db.customDomain.deleteMany({ where: { siteId } });
  await db.customDomain.createMany({
    data: data.customDomains.map((c) => ({ domain: c.domain, verified: c.verified, siteId })),
  });
  invalidateCustomDomainCache();
  return { ok: true, value: undefined };
}

