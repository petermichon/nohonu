import { generateVerificationToken } from './custom-domain-dns.ts';


export async function getVerificationToken(domain: string): Promise<{ token: string }> {
  const token = await generateVerificationToken(domain);
  return { token };
}

