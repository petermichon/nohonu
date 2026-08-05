import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { invalidateCustomDomainCache } from '../../core/sites/custom-domains-cache.ts';
import { syncCustomDomains } from '../../core/sites/sync-custom-domains.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import type { Result } from '../../shared/errors.ts';



export async function removeCustomDomain(
  sessionId: string,
  domain: string,
  customDomain: string,
): Promise<Result<void>> {
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
    return { ok: false, code: 'not_found', message: 'Custom domain not found' };
  }

  const filtered = data.customDomains.filter((entry) => {
    return entry.domain !== customDomain;
  });
  if (filtered.length === data.customDomains.length) {
    return { ok: false, code: 'not_found', message: 'Custom domain not found' };
  }

  data.customDomains = filtered;
  const siteId = await upsertSite(user, domain, data);
  if (!siteId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  await syncCustomDomains(siteId, data.customDomains ?? []);
  invalidateCustomDomainCache();
  return { ok: true, value: undefined };
}

