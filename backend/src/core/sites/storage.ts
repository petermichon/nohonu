import * as fs from 'node:fs/promises';
import { db } from '../../db.ts';
import { domainDir } from '../../shared/paths.ts';
import { SITES_DIR } from '../../config.ts';
import type { SiteData } from '../../shared/paths.ts';
import { versionPath, extractedDir, extractedFilePath } from './paths.ts';
import { readSiteMetadata, writeSiteMetadata } from './db.ts';
import { readVersion, openVersion } from './fs.ts';

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
      .sort((a, b) => {
        return b - a;
      });
    data.currentIndex = versionIndices.length > 0 ? (versionIndices[0] as number) : null;
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
  await db.site.deleteMany({ where: { AND: { userUsername: user, domain } } });
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
        const allHaveRoot = paths.every((p) => p.startsWith(commonRoot));
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
      if (relativePath.includes('..') || relativePath.startsWith('/')) continue;
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

export async function readActiveVersion(user: string, domain: string): Promise<Uint8Array | undefined> {
  const data = await readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) return undefined;
  try {
    return await readVersion(user, domain, data.currentIndex);
  } catch {
    return undefined;
  }
}

export async function openActiveVersion(user: string, domain: string): Promise<fs.FileHandle | undefined> {
  const data = await readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) return undefined;
  try {
    return await openVersion(user, domain, data.currentIndex);
  } catch {
    return undefined;
  }
}

export async function resetStorage(): Promise<void> {
  await db.user.deleteMany();
  await fs.rm(SITES_DIR, { recursive: true, force: true });
  await fs.mkdir(SITES_DIR, { recursive: true });
}
