import { generateVerificationToken } from '../generate-verification-token.ts';
import { resolveTxtRecords } from './resolve-txt-records.ts';

export async function dnsVerifyCustomDomain(domain: string, customDomain: string): Promise<boolean> {
  const expectedToken = await generateVerificationToken(domain);
  return (await resolveTxtRecords(`_nohonu.${customDomain}`)).includes(expectedToken);
}
