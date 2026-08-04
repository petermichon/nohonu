import type { SiteSummary } from '../../shared/site-summary.ts';

export type { SiteSummary };

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

export interface PublicSiteSummary extends SiteSummary {
  user: string;
}
