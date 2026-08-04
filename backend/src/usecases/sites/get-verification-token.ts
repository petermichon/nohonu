import { db } from '../../db.ts';
import { generateVerificationToken } from '../../shared/custom-domain-dns.ts';


export async function getVerificationToken(domain: string): Promise<{ token: string }> {
  const site = await db.site.findFirst({ where: { domain }, select: { userUsername: true } });
  const user = site?.userUsername ?? null;
  if (!user) {
    throw new Error('Site not found');
  }
  const token = await generateVerificationToken(domain);
  return { token };
}
