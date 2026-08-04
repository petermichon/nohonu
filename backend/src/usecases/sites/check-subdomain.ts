import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { listUsers } from '../../core/sites/list-users.ts';
import { listDomains } from '../../core/sites/list-domains.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';


export async function checkSubdomain(subdomain: string): Promise<boolean> {
  if (!subdomain || !VALID_DOMAIN.test(subdomain)) return false;
  const users = await listUsers();
  for (const user of users) {
    const domains = await listDomains(user);
    for (const domain of domains) {
      const data = await readSiteMetadata(user, domain);
      if (data?.subdomain === subdomain) return true;
    }
  }
  return false;
}


