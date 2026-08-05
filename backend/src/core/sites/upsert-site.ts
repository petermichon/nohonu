import { db } from '../../db.ts';
import type { SiteData } from '../../shared/paths.ts';
import { siteWhere } from '../../shared/site-where.ts';

export async function upsertSite(user: string, domain: string, data: SiteData): Promise<string | undefined> {
  const siteId = data.siteId || `${user}-${domain}`;

  await db.site.upsert({
    where: siteWhere(user, domain),
    create: {
      siteId,
      domain,
      userUsername: user,
      nextIndex: data.nextIndex,
      currentIndex: data.currentIndex,
      enabled: data.enabled,
      account: data.account ?? user,
      displayName: data.displayName ?? domain,
      subdomain: data.subdomain,
      coverImage: data.coverImage,
      lastDeployedAt: data.lastDeployedAt,
      starCount: data.starCount ?? 0,
      extracted: data.extracted,
    },
    update: {
      nextIndex: data.nextIndex,
      currentIndex: data.currentIndex,
      enabled: data.enabled,
      account: data.account ?? user,
      displayName: data.displayName ?? domain,
      subdomain: data.subdomain,
      coverImage: data.coverImage,
      lastDeployedAt: data.lastDeployedAt,
      starCount: data.starCount ?? 0,
      extracted: data.extracted,
    },
  });

  const dbSite = await db.site.findUnique({ where: siteWhere(user, domain), select: { id: true } });
  return dbSite?.id;
}
