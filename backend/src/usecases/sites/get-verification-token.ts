import { site as siteTable } from '../../db/site.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { generateVerificationToken } from '../../shared/generate-verification-token.ts';

export async function getVerificationToken(user: string, siteId: string): Promise<{ token: string }> {
  const site = await siteTable.findUnique({ where: siteWhere(user, siteId), select: { userUsername: true } });
  const siteUser = site?.userUsername ?? null;
  if (!siteUser) {
    throw new Error('Site not found');
  }
  const token = await generateVerificationToken(user, siteId);
  return { token };
}
