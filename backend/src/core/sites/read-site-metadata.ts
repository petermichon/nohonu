import { db } from '../../db.ts';
import type { SiteData } from '../../shared/paths.ts';

type SiteRecord = {
  id: string;
  siteId: string;
  domain: string;
  userUsername: string;
  nextIndex: number;
  currentIndex: number | null;
  enabled: boolean;
  account: string | null;
  displayName: string | null;
  subdomain: string | null;
  coverImage: string | null;
  lastDeployedAt: number | null;
  starCount: number;
  extracted: boolean;
  versions: { index: number; type: string; repo: string | null; branch: string | null; createdAt: number }[];
  repoHistories: { repo: string; branch: string; lastUsed: number }[];
  customDomains: { domain: string; verified: boolean }[];
  starredBy: { username: string }[];
};

function toSiteData(record: SiteRecord): SiteData {
  const versions: SiteData['versions'] = {};
  for (const v of record.versions) {
    const source: SiteData['versions'][string]['source'] = v.type === 'github'
      ? { type: 'github', repo: v.repo ?? '', branch: v.branch ?? '' }
      : { type: 'upload' };
    versions[String(v.index)] = { source, createdAt: v.createdAt };
  }

  return {
    siteId: record.siteId,
    nextIndex: record.nextIndex,
    currentIndex: record.currentIndex,
    enabled: record.enabled,
    account: record.account ?? undefined,
    displayName: record.displayName ?? undefined,
    repoHistory: record.repoHistories.map((r) => ({
      repo: r.repo,
      branch: r.branch,
      lastUsed: r.lastUsed,
    })),
    versions,
    extracted: record.extracted,
    customDomains: record.customDomains.map((c) => ({
      domain: c.domain,
      verified: c.verified,
    })),
    subdomain: record.subdomain ?? undefined,
    coverImage: record.coverImage ?? undefined,
    lastDeployedAt: record.lastDeployedAt ?? undefined,
    starCount: record.starCount,
    starredBy: record.starredBy.map((s) => s.username),
  };
}

function siteWhere(user: string, domain: string): { userUsername_domain: { userUsername: string; domain: string } } {
  return { userUsername_domain: { userUsername: user, domain } };
}

export async function readSiteMetadata(user: string, domain: string): Promise<SiteData | undefined> {
  const record = await db.site.findUnique({
    where: siteWhere(user, domain),
    include: { versions: true, repoHistories: true, customDomains: true, starredBy: true },
  });
  if (!record) return undefined;
  return toSiteData(record);
}
