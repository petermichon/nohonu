import type { SiteData } from './paths.ts';

export function toSiteCreate(user: string, domain: string, data: SiteData) {
  const siteId = data.siteId || `${user}-${domain}`;
  return {
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
  };
}

export function toSiteUpdate(user: string, domain: string, data: SiteData) {
  return {
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
  };
}
