import { db } from '../../db.ts';

export async function listDomains(user: string): Promise<string[]> {
  const sites = await db.site.findMany({
    where: { userUsername: user },
    select: { domain: true },
  });
  return sites.map((s) => s.domain);
}
