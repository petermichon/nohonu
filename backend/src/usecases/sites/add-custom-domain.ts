import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { customDomain as customDomainTable } from '../../db/custom-domain.ts';
import { session } from '../../db/session.ts';
import { site } from '../../db/site.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import type { Result } from '../../shared/errors.ts';



export async function addCustomDomain(sessionId: string, siteId: string, customDomain: string): Promise<Result<void>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await readSiteMetadata(user, siteId);
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
  const siteRowId = await upsertSite(user, siteId, data);
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  await customDomainTable.deleteMany({ where: { siteId: siteRowId } });
  await customDomainTable.createMany({
    data: data.customDomains.map((c) => ({ domain: c.domain, verified: c.verified, siteId: siteRowId })),
  });
  return { ok: true, value: undefined };
}
