import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { customDomain as customDomainTable } from '../../db/custom-domain.ts';
import { session } from '../../db/session.ts';
import { dnsVerifyCustomDomain } from '../../shared/custom-domain-dns.ts';
import { validateSession } from '../../shared/session-check.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { site } from '../../db/site.ts';

import type { Result } from '../../shared/errors.ts';




export async function verifyCustomDomain(
  sessionId: string,
  domain: string,
  customDomain: string,
): Promise<Result<{ verified: boolean }>> {
  const sessionRecord = await session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  if (!data.customDomains) {
    return { ok: false, code: 'not_found', message: 'Custom domain not found' };
  }

  const entry = data.customDomains.find((e) => e.domain === customDomain);
  if (!entry) {
    return { ok: false, code: 'not_found', message: 'Custom domain not found' };
  }

  const isVerified = await dnsVerifyCustomDomain(domain, customDomain);
  entry.verified = isVerified;

  const siteId = (await site.upsert(toSiteUpsert(user, domain, data)))?.id;
  if (!siteId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  await customDomainTable.deleteMany({ where: { siteId } });
  await customDomainTable.createMany({
    data: data.customDomains.map((c) => ({ domain: c.domain, verified: c.verified, siteId })),
  });

  return { ok: true, value: { verified: isVerified } };
}

