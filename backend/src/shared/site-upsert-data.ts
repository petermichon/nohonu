import type { Prisma } from '../../generated/prisma/client.ts';
import type { SiteData } from './paths.ts';
import { siteWhere } from './site-where.ts';

export function toSiteUpsert(user: string, siteId: string, data: SiteData): Prisma.SiteUpsertArgs {
  return {
    where: siteWhere(user, siteId),
    create: toSiteCreate(user, siteId, data),
    update: toSiteUpdate(user, siteId, data),
    select: { id: true },
  };
}

export function toSiteCreate(user: string, siteId: string, data: SiteData): Prisma.SiteUncheckedCreateInput {
  return {
    siteId,
    userUsername: user,
    nextIndex: data.nextIndex,
    currentIndex: data.currentIndex,
    enabled: data.enabled,
    account: data.account ?? user,
    displayName: data.displayName ?? siteId,
    subdomain: data.subdomain,
    coverImage: data.coverImage,
    lastDeployedAt: data.lastDeployedAt,
    starCount: data.starCount ?? 0,
    extracted: data.extracted,
  };
}

export function toSiteUpdate(user: string, siteId: string, data: SiteData): Prisma.SiteUncheckedUpdateInput {
  return {
    nextIndex: data.nextIndex,
    currentIndex: data.currentIndex,
    enabled: data.enabled,
    account: data.account ?? user,
    displayName: data.displayName ?? siteId,
    subdomain: data.subdomain,
    coverImage: data.coverImage,
    lastDeployedAt: data.lastDeployedAt,
    starCount: data.starCount ?? 0,
    extracted: data.extracted,
  };
}
