import * as dns from 'node:dns/promises';
import { generateVerificationToken } from '../generate-verification-token.ts';

export async function dnsVerifyCustomDomain(domain: string, customDomain: string): Promise<boolean> {
  const expectedToken = await generateVerificationToken(domain);
  const txtRecordName = `_nohonu.${customDomain}`;

  try {
    const records = await dns.resolveTxt(txtRecordName);
    if (!records || records.length === 0) return false;

    for (const record of records) {
      for (const value of record) {
        if (value === expectedToken) return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`DNS lookup failed for ${txtRecordName}:`, error);
    return false;
  }
}
