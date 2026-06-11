const sitesDir = Deno.env.get('SITES_DIR') ?? `${import.meta.dirname}/../../data`;
export const SITES_DIR = sitesDir;
export const VALID_DOMAIN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

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
  accent?: string;
  repoHistory: RepoEntry[];
  versions: Record<string, VersionEntry>;
  extracted: boolean;
  customDomains?: CustomDomainEntry[];
};

export async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}
