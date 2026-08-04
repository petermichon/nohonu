import * as sitesDb from '../../core/sites/db.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import type { Result } from '../../shared/errors.ts';
import { invalidateCustomDomainCache } from '../../core/sites/custom-domains-cache.ts';


export async function addCustomDomain(sessionId: string, domain: string, customDomain: string): Promise<Result<void>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
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
  await sitesDb.writeSiteMetadata(user, domain, data);
  invalidateCustomDomainCache();
  return { ok: true, value: undefined };
}

