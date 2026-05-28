import { SITES_DIR, getVersionPath, Version, VersionSource } from '../shared/paths.ts';
import { loadSiteData, saveSiteData } from './meta.ts';
import { readZip } from '../shared/zip.ts';

export async function listVersions(domain: string): Promise<Version[]> {
  const data = await loadSiteData(domain);
  const versions: Version[] = [];

  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    const filePath = getVersionPath(domain, index);
    let stat: Deno.FileInfo | undefined;
    try {
      stat = await Deno.stat(filePath);
    } catch {
      /* file does not exist */
    }
    if (stat) {
      versions.push({ index, size: stat.size, source: entry.source, createdAt: entry.createdAt });
    }
  }

  versions.sort((a, b) => b.index - a.index);
  return versions;
}

export async function saveZipAsVersion(
  domain: string,
  zipData: Uint8Array,
  source: VersionSource,
): Promise<{ success: true; domain: string; index: number }> {
  await Deno.mkdir(SITES_DIR, { recursive: true });
  const data = await loadSiteData(domain);
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source, createdAt: Date.now() };
  if (data.currentIndex === null) {
    data.currentIndex = index;
  }

  await Deno.writeFile(getVersionPath(domain, index), zipData);
  await saveSiteData(domain, data);
  return { success: true, domain, index };
}

export async function resolveZipPath(domain: string): Promise<string | undefined> {
  const data = await loadSiteData(domain);
  if (!data.enabled || data.currentIndex === null) {
    return undefined;
  }
  const path = getVersionPath(domain, data.currentIndex);
  return path;
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
