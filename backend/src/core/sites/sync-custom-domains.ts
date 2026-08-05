import { db } from '../../db.ts';
import type { CustomDomainEntry } from '../../shared/paths.ts';

export async function syncCustomDomains(siteId: string, customDomains: CustomDomainEntry[]): Promise<void> {
  await db.customDomain.deleteMany({ where: { siteId } });
  if (customDomains.length > 0) {
    await db.customDomain.createMany({
      data: customDomains.map((c) => ({
        domain: c.domain,
        verified: c.verified,
        siteId,
      })),
    });
  }
}
