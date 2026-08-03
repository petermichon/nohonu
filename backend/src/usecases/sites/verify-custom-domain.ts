import * as sitesDb from '../../core/sites/db.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import type { Result } from '../../shared/errors.ts';
import { invalidateCustomDomainCache } from './custom-domains-cache.ts';
import { dnsVerifyCustomDomain } from './custom-domain-dns.ts';


export async function verifyCustomDomain(
  sessionId: string,
  domain: string,
  customDomain: string,
): Promise<Result<{ verified: boolean }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
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

  await sitesDb.writeSiteMetadata(user, domain, data);
  invalidateCustomDomainCache();

  return { ok: true, value: { verified: isVerified } };
}

