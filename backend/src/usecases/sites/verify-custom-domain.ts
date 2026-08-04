import { writeSiteMetadata } from '../../core/sites/write-site-metadata.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import type { Result } from '../../shared/errors.ts';
import { invalidateCustomDomainCache } from '../../core/sites/custom-domains-cache.ts';
import { dnsVerifyCustomDomain } from '../../shared/custom-domain-dns.ts';


export async function verifyCustomDomain(
  sessionId: string,
  domain: string,
  customDomain: string,
): Promise<Result<{ verified: boolean }>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
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

  await writeSiteMetadata(user, domain, data);
  invalidateCustomDomainCache();

  return { ok: true, value: { verified: isVerified } };
}

