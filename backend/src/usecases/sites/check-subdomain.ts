import * as sitesDb from '../../core/sites/db.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';


export async function checkSubdomain(subdomain: string): Promise<boolean> {
  if (!subdomain || !VALID_DOMAIN.test(subdomain)) return false;
  const users = await sitesDb.listUsers();
  for (const user of users) {
    const domains = await sitesDb.listDomains(user);
    for (const domain of domains) {
      const data = await sitesDb.readSiteMetadata(user, domain);
      if (data?.subdomain === subdomain) return true;
    }
  }
  return false;
}


