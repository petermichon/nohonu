import { site as siteTable } from '../../db/site.ts';
import { generateVerificationToken } from '../../shared/generate-verification-token.ts';

export async function getVerificationToken(domain: string): Promise<{ token: string }> {
  const site = await siteTable.findFirst({ where: { domain }, select: { userUsername: true } });
  const user = site?.userUsername ?? null;
  if (!user) {
    throw new Error('Site not found');
  }
  const token = await generateVerificationToken(domain);
  return { token };
}
