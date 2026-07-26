import * as fs from 'node:fs/promises';
import { SITES_DIR, SiteData, domainDir } from '../../shared/paths.ts';

function metadataPath(user: string, domain: string): string {
  return `${domainDir(user, domain)}/metadata.json`;
}

export function versionsDir(user: string, domain: string): string {
  return `${domainDir(user, domain)}/versions`;
}

export function versionPath(user: string, domain: string, index: number): string {
  return `${versionsDir(user, domain)}/${index}.zip`;
}

function extractedDir(user: string, domain: string): string {
  return `${domainDir(user, domain)}/extracted`;
}

function extractedFilePath(user: string, domain: string, filePath: string): string {
  const cleanPath = filePath.replace(/^\/+/, '');
  const dir = extractedDir(user, domain);
  return `${dir}/${cleanPath}`.replace(/\/+/g, '/');
}

export const DEFAULT_DATA: SiteData = {
  siteId: '',
  nextIndex: 1,
  currentIndex: null,
  enabled: true,
  repoHistory: [],
  versions: {},
  extracted: false,
  lastDeployedAt: undefined,
  starCount: 0,
  starredBy: [],
};

export async function readSiteMetadata(user: string, domain: string): Promise<SiteData | undefined> {
  let content: string;
  try {
    content = await fs.readFile(metadataPath(user, domain), 'utf-8');
  } catch {
    return undefined;
  }

  try {
    const parsed = JSON.parse(content) as Partial<SiteData>;
    const data = { ...DEFAULT_DATA, ...parsed };

    if (!data.siteId) {
      data.siteId = `${user}-${domain}`;
    }

    if (!data.displayName || data.displayName === domain) {
      data.displayName = domain;
    }

    if (!data.account) {
      data.account = user;
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to parse metadata file for ${user}/${domain}: ${message}`);
    return undefined;
  }
}

export async function writeSiteMetadata(user: string, domain: string, data: SiteData): Promise<void> {
  if (data.nextIndex < 1) {
    console.error(`writeSiteMetadata: nextIndex must be >= 1 for ${user}/${domain}, got ${data.nextIndex}`);
    return;
  }
  if (data.currentIndex !== null) {
    try {
      await fs.stat(versionPath(user, domain, data.currentIndex));
    } catch {
      console.error(`writeSiteMetadata: currentIndex ${data.currentIndex} has no version file for ${user}/${domain}`);
      return;
    }
  }
  await fs.writeFile(metadataPath(user, domain), JSON.stringify(data, null, 2));
}

export async function openVersion(user: string, domain: string, index: number): Promise<fs.FileHandle> {
  return await fs.open(versionPath(user, domain, index));
}

export async function readVersion(user: string, domain: string, index: number): Promise<Uint8Array> {
  return await fs.readFile(versionPath(user, domain, index));
}

export async function deleteVersionFile(user: string, domain: string, index: number): Promise<boolean> {
  const data = await readSiteMetadata(user, domain);
  if (data === undefined) {
    console.error(`deleteVersionFile: site not found: ${user}/${domain}`);
    return false;
  }

  try {
    await fs.unlink(versionPath(user, domain, index));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`deleteVersionFile: failed to delete version file for ${user}/${domain}@${index}: ${message}`);
    return false;
  }

  delete data.versions[index];
  if (data.currentIndex === index) {
    const versionIndices = Object.keys(data.versions)
      .map(Number)
      .sort((a, b) => { return b - a; });
    data.currentIndex = versionIndices.length > 0 ? versionIndices[0] as number : null;
  }
  await writeSiteMetadata(user, domain, data);
  return true;
}

export async function setCurrentVersion(user: string, domain: string, index: number): Promise<boolean> {
  const data = await readSiteMetadata(user, domain);
  if (data === undefined) {
    console.error(`setCurrentVersion: site not found: ${user}/${domain}`);
    return false;
  }

  try {
    await fs.stat(versionPath(user, domain, index));
  } catch {
    console.error(`setCurrentVersion: version ${index} does not exist for ${user}/${domain}`);
    return false;
  }

  data.currentIndex = index;
  data.enabled = true;
  await writeSiteMetadata(user, domain, data);
  return true;
}

export async function deleteExtractedFiles(user: string, domain: string): Promise<void> {
  try {
    await fs.rm(extractedDir(user, domain), { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete extracted site for ${user}/${domain}: ${message}`);
  }

  const data = await readSiteMetadata(user, domain);
  if (data) {
    data.extracted = false;
    await writeSiteMetadata(user, domain, data);
  }
}

export async function deleteSiteFiles(user: string, domain: string): Promise<void> {
  try {
    await fs.rm(domainDir(user, domain), { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete site directory for ${user}/${domain}: ${message}`);
  }
}

export async function versionExists(user: string, domain: string, index: number): Promise<boolean> {
  try {
    await fs.stat(versionPath(user, domain, index));
    return true;
  } catch {
    return false;
  }
}

export async function extractedSiteExists(user: string, domain: string): Promise<boolean> {
  const data = await readSiteMetadata(user, domain);
  if (!data?.extracted) return false;
  const dir = extractedDir(user, domain);
  try {
    await fs.stat(dir);
    const indexPath = extractedFilePath(user, domain, 'index.html');
    try {
      await fs.stat(indexPath);
      return true;
    } catch {
      data.extracted = false;
      await writeSiteMetadata(user, domain, data);
      return false;
    }
  } catch {
    data.extracted = false;
    await writeSiteMetadata(user, domain, data);
    return false;
  }
}

export async function readExtractedFile(user: string, domain: string, filePath: string): Promise<fs.FileHandle | undefined> {
  const fullPath = extractedFilePath(user, domain, filePath);
  try {
    return await fs.open(fullPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read extracted file ${fullPath}: ${message}`);
    return undefined;
  }
}

export async function extractFiles(user: string, domain: string, files: Record<string, Uint8Array>): Promise<void> {
  try {
    const targetDir = extractedDir(user, domain);
    await fs.mkdir(targetDir, { recursive: true });

    const paths = Object.keys(files);
    if (paths.length > 0) {
      const firstPath = paths[0];
      if (!firstPath) {
        return;
      }
      const firstSlashIndex = firstPath.indexOf('/');
      if (firstSlashIndex !== -1) {
        const commonRoot = firstPath.substring(0, firstSlashIndex + 1);
        const allHaveRoot = paths.every((p) => {
          return p.startsWith(commonRoot);
        });
        if (allHaveRoot) {
          const strippedFiles: Record<string, Uint8Array> = {};
          for (const [path, data] of Object.entries(files)) {
            const strippedPath = path.substring(commonRoot.length);
            if (strippedPath) {
              strippedFiles[strippedPath] = data;
            }
          }
          files = strippedFiles;
        }
      }
    }

    for (const [relativePath, data] of Object.entries(files)) {
      if (relativePath.includes('..') || relativePath.startsWith('/')) {
        continue;
      }
      const outPath = extractedFilePath(user, domain, relativePath);
      const dir = outPath.substring(0, outPath.lastIndexOf('/'));
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(outPath, data);
    }

    const siteData = await readSiteMetadata(user, domain);
    if (siteData) {
      siteData.extracted = true;
      await writeSiteMetadata(user, domain, siteData);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`extractFiles: extraction failed for ${user}/${domain}: ${message}`);
    await deleteExtractedFiles(user, domain);
  }
}

export async function listUsers(): Promise<string[]> {
  const users: string[] = [];
  try {
    const entries = await fs.readdir(SITES_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        try {
          await fs.stat(`${SITES_DIR}/${entry.name}/user.json`);
          users.push(entry.name);
        } catch {
          // not a user directory, skip
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read sites directory: ${message}`);
  }
  return users;
}

export async function listDomains(user: string): Promise<string[]> {
  const domains: string[] = [];
  const userDir = `${SITES_DIR}/${user}`;
  try {
    const entries = await fs.readdir(userDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          await fs.stat(metadataPath(user, entry.name));
          domains.push(entry.name);
        } catch {
          // not a site directory, skip
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read user directory ${userDir}: ${message}`);
  }
  return domains;
}

export async function readActiveVersion(user: string, domain: string): Promise<Uint8Array | undefined> {
  const data = await readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) {
    return undefined;
  }
  try {
    return await readVersion(user, domain, data.currentIndex);
  } catch {
    return undefined;
  }
}

export async function openActiveVersion(user: string, domain: string): Promise<fs.FileHandle | undefined> {
  const data = await readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) {
    return undefined;
  }
  try {
    return await openVersion(user, domain, data.currentIndex);
  } catch {
    return undefined;
  }
}
