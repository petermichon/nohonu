import { SITES_DIR } from '../config.ts';

export const VALID_DOMAIN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
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

// Path helpers for user-based structure: /data/{user}/{domain}/
// Note: domain is used for directory structure, siteId is the stable identifier
export function domainDir(user: string, domain: string): string {
  return `${SITES_DIR}/${user}/${domain}`;
}

export function coverImagePath(user: string, domain: string): string {
  return `${domainDir(user, domain)}/cover.jpg`;
}

export function versionsDir(user: string, domain: string): string {
  return `${domainDir(user, domain)}/versions`;
}

export function versionPath(user: string, domain: string, index: number): string {
  return `${versionsDir(user, domain)}/${index}.zip`;
}

export function extractedDir(user: string, domain: string): string {
  return `${domainDir(user, domain)}/extracted`;
}

export function extractedFilePath(user: string, domain: string, filePath: string): string {
  const cleanPath = filePath.replace(/^\/+/, '');
  const dir = extractedDir(user, domain);
  return `${dir}/${cleanPath}`.replace(/\/+/g, '/');
}

export function getProfilePicturePath(sitesDir: string, username: string): string {
  return `${sitesDir}/${username}/profile.jpg`;
}
