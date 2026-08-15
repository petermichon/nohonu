import { user as userTable } from '../../db/user.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { site } from '../../db/site.ts';

export async function getAllCustomDomains(
  account?: string,
): Promise<{ user: string; siteId: string; customDomain: string; verified: boolean }[]> {
  const users = (await userTable.findMany({ select: { username: true } })).map((u) => u.username);
  const allCustomDomains: { user: string; siteId: string; customDomain: string; verified: boolean }[] = [];

  for (const user of users) {
    const domains = (await site.findMany({ where: { userUsername: user }, select: { siteId: true } })).map((s) => s.siteId);
    for (const siteId of domains) {
      const data = await readSiteMetadata(user, siteId);
      if (account && data?.account !== account) continue;
      if (data?.customDomains) {
        for (const entry of data.customDomains) {
          allCustomDomains.push({
            user,
            siteId,
            customDomain: entry.domain,
            verified: entry.verified,
          });
        }
      }
    }
  }

  return allCustomDomains;
}

