export const SITES_DIR = Deno.env.get('SITES_DIR') ?? './sites';
export const VALID_DOMAIN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

export type VersionSource = { type: 'upload' } | { type: 'github'; repo: string; branch: string };
export type Version = {
  timestamp: number;
  size: number;
  source?: VersionSource;
};
export type SiteMeta = { accent?: string };

export function getVersionPath(domain: string, timestamp: number): string {
  return `${SITES_DIR}/${domain}@${timestamp}.zip`;
}

export function getVersionMetaPath(domain: string, timestamp: number): string {
  return `${SITES_DIR}/${domain}@${timestamp}.json`;
}

export function getRepoHistoryPath(domain: string): string {
  return `${SITES_DIR}/${domain}.repos.json`;
}

export function getMetaPath(domain: string): string {
  return `${SITES_DIR}/${domain}.meta.json`;
}

export function getCurrentVersionPath(domain: string, enabled = true): string {
  let suffix: string;
  if (enabled) {
    suffix = '';
  } else {
    suffix = '.disabled';
  }
  return `${SITES_DIR}/${domain}.zip${suffix}`;
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}
