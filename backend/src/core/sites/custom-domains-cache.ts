import { db } from '../../db.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

// Custom domain registry cache: Map<customDomain, internalDomain>
let customDomainCache: Map<string, string> | null = null;

async function buildCustomDomainCache(): Promise<void> {
  const cache = new Map<string, string>();
  // Need to iterate all users to build complete cache
  const users = (await db.user.findMany({ select: { username: true } })).map((u) => u.username);

  for (const user of users) {
    const domains = (await db.site.findMany({ where: { userUsername: user }, select: { domain: true } })).map((s) => s.domain);
    for (const domain of domains) {
      const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const data = record ? toSiteData(record) : undefined;
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
