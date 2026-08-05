import { db } from '../../db.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

export async function getAllCustomDomains(
  account?: string,
): Promise<{ user: string; siteDomain: string; customDomain: string; verified: boolean }[]> {
  const users = (await db.user.findMany({ select: { username: true } })).map((u) => u.username);
  const allCustomDomains: { user: string; siteDomain: string; customDomain: string; verified: boolean }[] = [];

  for (const user of users) {
    const domains = (await db.site.findMany({ where: { userUsername: user }, select: { domain: true } })).map((s) => s.domain);
    for (const domain of domains) {
      const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const data = record ? toSiteData(record) : undefined;
      if (account && data?.account !== account) continue;
      if (data?.customDomains) {
        for (const entry of data.customDomains) {
          allCustomDomains.push({
            user,
            siteDomain: domain,
            customDomain: entry.domain,
            verified: entry.verified,
          });
        }
      }
    }
  }

  return allCustomDomains;
}

