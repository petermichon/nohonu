import * as sitesDb from './db.ts';


// Custom domain registry cache: Map<customDomain, internalDomain>
let customDomainCache: Map<string, string> | null = null;

async function buildCustomDomainCache(): Promise<void> {
  const cache = new Map<string, string>();
  // Need to iterate all users to build complete cache
  const users = await sitesDb.listUsers();

  for (const user of users) {
    const domains = await sitesDb.listDomains(user);
    for (const domain of domains) {
      const data = await sitesDb.readSiteMetadata(user, domain);
      if (data?.customDomains) {
        for (const entry of data.customDomains) {
          if (entry.verified) {
            cache.set(entry.domain, domain);
          }
        }
      }
    }
  }

  customDomainCache = cache;
}

export function invalidateCustomDomainCache(): void {
  customDomainCache = null;
}

export async function getCustomDomainCache(): Promise<Map<string, string>> {
  if (!customDomainCache) {
    await buildCustomDomainCache();
  }
  return customDomainCache as Map<string, string>;
}

