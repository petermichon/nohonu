import * as sitesDb from '../../core/sites/db.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import type { Result } from '../../shared/errors.ts';
import { invalidateCustomDomainCache } from '../../core/sites/custom-domains-cache.ts';


export async function addCustomDomain(sessionId: string, domain: string, customDomain: string): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
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

