import {
  SITES_DIR,
  fileExists,
  getCurrentVersionPath,
  getVersionMetaPath,
  getVersionPath,
  Version,
  VersionSource,
} from '../shared/paths.ts';
import { readZip } from '../shared/zip.ts';

export async function loadVersionSource(domain: string, timestamp: number): Promise<VersionSource | undefined> {
  try {
    const content = await Deno.readTextFile(getVersionMetaPath(domain, timestamp));
    return JSON.parse(content) as VersionSource;
  } catch {
    return undefined;
  }
}

export async function listVersions(domain: string): Promise<Version[]> {
  const versions: Version[] = [];
  const prefix = `${domain}@`;

  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.name.startsWith(prefix) && entry.name.endsWith('.zip') && !entry.name.includes('.disabled')) {
        const timestamp = parseInt(entry.name.slice(prefix.length, -4), 10);
        if (!isNaN(timestamp)) {
          const filePath = `${SITES_DIR}/${entry.name}`;
          let stat: Deno.FileInfo | undefined;
          try {
            stat = await Deno.stat(filePath);
          } catch {
            /* file does not exist */
          }
          if (stat) {
            const source = await loadVersionSource(domain, timestamp);
            versions.push({
              timestamp,
              size: stat.size,
              source,
            });
          }
        }
      }
    }
  } catch {
    /* no dir */
  }

  versions.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });
  return versions;
}

export async function getCurrentVersionTimestamp(domain: string): Promise<number | undefined> {
  for (const enabled of [true, false]) {
    let stat: Deno.FileInfo | undefined;
    try {
      stat = await Deno.stat(getCurrentVersionPath(domain, enabled));
    } catch {
      /* file does not exist */
    }
    if (stat) {
      const mtime = stat.mtime?.getTime();
      return mtime ?? undefined;
    }
  }
  return undefined;
}

export async function saveZipAsVersion(
  domain: string,
  zipData: Uint8Array,
  source?: VersionSource,
): Promise<{ success: true; domain: string; timestamp: number }> {
  await Deno.mkdir(SITES_DIR, { recursive: true });
  const timestamp = Date.now();
  const versionPath = getVersionPath(domain, timestamp);
  await Deno.writeFile(versionPath, zipData);
  if (source) {
    const metaPath = getVersionMetaPath(domain, timestamp);
    const json = JSON.stringify(source);
    await Deno.writeTextFile(metaPath, json);
  }
  const hasLive = await resolveZipPath(domain);
  if (!hasLive) {
    const oldVersionPath = getVersionPath(domain, timestamp);
    const currentPath = getCurrentVersionPath(domain, true);
    await Deno.rename(oldVersionPath, currentPath);
    if (source) {
      const oldMetaPath = getVersionMetaPath(domain, timestamp);
      const newMetaPath = getVersionMetaPath(domain, 0);
      await Deno.rename(oldMetaPath, newMetaPath);
    }
    const siteDir = `${SITES_DIR}/${domain}`;
    try {
      await Deno.remove(siteDir, { recursive: true });
    } catch {
      /* already gone */
    }
  }
  return { success: true, domain, timestamp };
}

export async function resolveZipPath(domain: string): Promise<string | undefined> {
  const enabled = getCurrentVersionPath(domain, true);
  if (await fileExists(enabled)) {
    return enabled;
  }
  const disabled = getCurrentVersionPath(domain, false);
  if (await fileExists(disabled)) {
    return disabled;
  }
  return undefined;
}

const FAVICON_CANDIDATES: { name: string; type: string }[] = [
  { name: 'favicon.ico', type: 'image/x-icon' },
  { name: 'favicon.png', type: 'image/png' },
  { name: 'favicon.svg', type: 'image/svg+xml' },
];

export async function getIcon(domain: string): Promise<{ data: Uint8Array; type: string } | undefined> {
  const zipPath = await resolveZipPath(domain);
  if (!zipPath) {
    return undefined;
  }
  const zipData = await Deno.readFile(zipPath);
  const files = await readZip(zipData);
  if (!files) {
    return undefined;
  }
  for (const { name, type } of FAVICON_CANDIDATES) {
    const data = files[name];
    if (data && data.length > 0) {
      return { data, type };
    }
  }
  return undefined;
}
