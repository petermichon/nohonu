import * as sitesDb from '../../core/sites/db.ts';


export async function findUserForDomain(domain: string): Promise<string | null> {
  const users = await sitesDb.listUsers();
  for (const user of users) {
    const domains = await sitesDb.listDomains(user);
    if (domains.includes(domain)) {
      return user;
    }
  }
  return null;
}


