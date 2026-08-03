import { findUserForDomain } from '../../core/sites/find-user-for-domain.ts';
import { generateVerificationToken } from './custom-domain-dns.ts';


export async function getVerificationToken(domain: string): Promise<{ token: string }> {
  const user = await findUserForDomain(domain);
  if (!user) {
    throw new Error('Site not found');
  }
  const token = await generateVerificationToken(domain);
  return { token };
}
