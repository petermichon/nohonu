const sitesDir = Deno.env.get('SITES_DIR') ?? `${import.meta.dirname}/../../data`;
export const SITES_DIR = sitesDir;
export const SUBDOMAIN_BASE = Deno.env.get('SUBDOMAIN_BASE') ?? 'localhost:8080';
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
  nextIndex: number;
  currentIndex: number | null;
  enabled: boolean;
  account?: string;
  repoHistory: RepoEntry[];
  versions: Record<string, VersionEntry>;
  extracted: boolean;
  customDomains?: CustomDomainEntry[];
  subdomain?: string;
};

export async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

export const MAX_ZIP_BYTES = 52_428_800; // 50 MB

// Path helpers for user-based structure: /data/{user}/{domain}/
export function domainDir(user: string, domain: string): string {
  return `${SITES_DIR}/${user}/${domain}`;
}

export type UsecaseResult<T> = { ok: true; value: T } | { ok: false; error: string; status: number };
