import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { listUsers } from '../../core/sites/list-users.ts';
import { listDomains } from '../../core/sites/list-domains.ts';


export async function getAllCustomDomains(
  account?: string,
): Promise<{ user: string; siteDomain: string; customDomain: string; verified: boolean }[]> {
  const users = await listUsers();
  const allCustomDomains: { user: string; siteDomain: string; customDomain: string; verified: boolean }[] = [];

  for (const user of users) {
    const domains = await listDomains(user);
    for (const domain of domains) {
      const data = await readSiteMetadata(user, domain);
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

