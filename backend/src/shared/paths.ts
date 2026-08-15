import { SITES_DIR } from '../config.ts';

export const VALID_SITE_ID = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
export const VALID_CUSTOM_DOMAIN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;
export const MAX_CUSTOM_DOMAIN_LENGTH = 253;

export type VersionSource = { type: 'upload' } | { type: 'github'; repo: string; branch: string };
export type VersionEntry = { source: VersionSource; createdAt: number };
export type Version = {
  index: number;
  size: number;
  source: VersionSource;
  createdAt: number;
};
export type RepoEntry = { repo: string; branch: string; lastUsed: number };
export type CustomDomainEntry = { domain: string; verified: boolean };
export type SiteData = {
  siteId: string;
  nextIndex: number;
  currentIndex: number | null;
  enabled: boolean;
  account?: string;
  displayName?: string;
  repoHistory: RepoEntry[];
  versions: Record<string, VersionEntry>;
  extracted: boolean;
  customDomains?: CustomDomainEntry[];
  subdomain?: string;
  coverImage?: string;
  lastDeployedAt?: number;
  starCount?: number;
  starredBy?: string[];
};

export const MAX_ZIP_BYTES = 52_428_800; // 50 MB

// Path helpers for user-based structure: /data/{user}/{siteId}/
// Note: siteId is the stable identifier and directory name; domain is not identity
export function siteDir(user: string, siteId: string): string {
  return `${SITES_DIR}/${user}/${siteId}`;
}

export function coverImagePath(user: string, siteId: string): string {
  return `${siteDir(user, siteId)}/cover.jpg`;
}

export function versionsDir(user: string, siteId: string): string {
  return `${siteDir(user, siteId)}/versions`;
}

export function versionPath(user: string, siteId: string, index: number): string {
  return `${versionsDir(user, siteId)}/${index}.zip`;
}

export function extractedDir(user: string, siteId: string): string {
  return `${siteDir(user, siteId)}/extracted`;
}

export function extractedFilePath(user: string, siteId: string, filePath: string): string {
  const cleanPath = filePath.replace(/^\/+/, '');
  const dir = extractedDir(user, siteId);
  return `${dir}/${cleanPath}`.replace(/\/+/g, '/');
}

export function getProfilePicturePath(sitesDir: string, username: string): string {
  return `${sitesDir}/${username}/profile.jpg`;
}
