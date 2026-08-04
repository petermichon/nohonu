import { db } from '../../db.ts';
import type { SiteData } from '../../shared/paths.ts';
import { siteWhere } from '../../shared/site-where.ts';

export async function writeSiteMetadata(user: string, domain: string, data: SiteData): Promise<void> {
  if (data.nextIndex < 1) {
    console.error(`writeSiteMetadata: nextIndex must be >= 1 for ${user}/${domain}, got ${data.nextIndex}`);
    return;
  }

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
  if (!dbSite) return;

  const siteIdFk = dbSite.id;

  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    const existingVersion = await db.version.findFirst({ where: { siteId: siteIdFk, index } });
    const sourceData: { type: string; repo: string | null; branch: string | null } = {
      type: entry.source.type,
      repo: null,
      branch: null,
    };
    if (entry.source.type === 'github') {
      sourceData.repo = entry.source.repo;
      sourceData.branch = entry.source.branch;
    }
    if (existingVersion) {
      await db.version.update({ where: { id: existingVersion.id }, data: { ...sourceData, createdAt: entry.createdAt } });
    } else {
      await db.version.create({ data: { index, createdAt: entry.createdAt, siteId: siteIdFk, ...sourceData } });
    }
  }

  const versionIndices = new Set(Object.keys(data.versions).map(Number));
  await db.version.deleteMany({ where: { siteId: siteIdFk, index: { notIn: Array.from(versionIndices) } } });

  await db.repoHistory.deleteMany({ where: { siteId: siteIdFk } });
  if (data.repoHistory.length > 0) {
    await db.repoHistory.createMany({
      data: data.repoHistory.map((r) => ({
        repo: r.repo,
        branch: r.branch,
        lastUsed: r.lastUsed,
        siteId: siteIdFk,
      })),
    });
  }

  await db.customDomain.deleteMany({ where: { siteId: siteIdFk } });
  if (data.customDomains && data.customDomains.length > 0) {
    await db.customDomain.createMany({
      data: data.customDomains.map((c) => ({
        domain: c.domain,
        verified: c.verified,
        siteId: siteIdFk,
      })),
    });
  }

  await db.starredBy.deleteMany({ where: { siteId: siteIdFk } });
  if (data.starredBy && data.starredBy.length > 0) {
    await db.starredBy.createMany({
      data: data.starredBy.map((username) => ({
        username,
        siteId: siteIdFk,
      })),
    });
  }
}
