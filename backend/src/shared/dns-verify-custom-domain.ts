import { generateVerificationToken } from './generate-verification-token.ts';

export async function dnsVerifyCustomDomain(
  domain: string,
  customDomain: string,
  resolveTxt: (hostname: string) => Promise<string[]>,
): Promise<boolean> {
  const expectedToken = await generateVerificationToken(domain);
  return (await resolveTxt(`_nohonu.${customDomain}`)).includes(expectedToken);
}
