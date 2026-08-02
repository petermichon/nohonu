export type VersionSource = { type: 'upload' } | { type: 'github'; repo: string; branch: string };

export interface VersionInfo {
  index: number;
  size: number;
  source: VersionSource;
  createdAt: number;
}

export interface CustomDomain {
  domain: string;
  verified: boolean;
}

export interface RepoHistoryEntry {
  repo: string;
  branch: string;
  lastUsed: number;
}

export interface SiteSummary {
  siteId: string;
  domain: string;
  enabled: boolean;
  hits: number;
  uptime: number | undefined;
  account?: string;
  accountProfilePicture?: string;
  displayName?: string;
  subdomain?: string;
  coverImage?: string;
  lastDeployedAt?: number;
  starCount?: number;
  isStarred?: boolean;
}

export interface PublicSiteSummary extends SiteSummary {
  user: string;
}
