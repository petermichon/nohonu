import { SITES_DIR, SiteData } from '../../shared/paths.ts';

// Path helpers for user-based structure: /data/{user}/{domain}/
export function domainDir(user: string, domain: string): string {
  return `${SITES_DIR}/${user}/${domain}`;
}

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
  // Remove leading slashes and normalize
  const cleanPath = filePath.replace(/^\/+/, '');
  const dir = extractedDir(user, domain);
  // Ensure no double slashes
  return `${dir}/${cleanPath}`.replace(/\/+/g, '/');
}

export const VALID_ACCENT = /^#[0-9a-fA-F]{6}$/;

export const DEFAULT_DATA: SiteData = {
  nextIndex: 1,
  currentIndex: null,
  enabled: true,
  repoHistory: [],
  versions: {},
  extracted: false,
};

// Low-level: Read site metadata
export async function readSiteMetadata(user: string, domain: string): Promise<SiteData | undefined> {
  let content: string;
  try {
    content = await Deno.readTextFile(metadataPath(user, domain));
  } catch (_error) {
    // File not found is expected for new sites, don't log error
    return undefined;
  }

  try {
    const parsed = JSON.parse(content) as Partial<SiteData>;
    return { ...DEFAULT_DATA, ...parsed };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to parse metadata file for ${user}/${domain}: ${message}`);
    return undefined;
  }
}

// Low-level: Write site metadata
export async function writeSiteMetadata(user: string, domain: string, data: SiteData): Promise<void> {
  if (data.nextIndex < 1) {
    console.error(`writeSiteMetadata: nextIndex must be >= 1 for ${user}/${domain}, got ${data.nextIndex}`);
    return;
  }
  if (data.currentIndex !== null) {
    try {
      await Deno.stat(versionPath(user, domain, data.currentIndex));
    } catch {
      console.error(`writeSiteMetadata: currentIndex ${data.currentIndex} has no version file for ${user}/${domain}`);
      return;
    }
  }
  await Deno.writeTextFile(metadataPath(user, domain), JSON.stringify(data, null, 2));
}

// Low-level: Open a version file handle
export async function openVersion(user: string, domain: string, index: number): Promise<Deno.FsFile> {
  return await Deno.open(versionPath(user, domain, index));
}

// Low-level: Read version file contents
export async function readVersion(user: string, domain: string, index: number): Promise<Uint8Array> {
  return await Deno.readFile(versionPath(user, domain, index));
}

// Low-level: Delete a version file and update metadata
export async function deleteVersionFile(user: string, domain: string, index: number): Promise<boolean> {
  const data = await readSiteMetadata(user, domain);
  if (data === undefined) {
    console.error(`deleteVersionFile: site not found: ${user}/${domain}`);
    return false;
  }

  try {
    await Deno.remove(versionPath(user, domain, index));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`deleteVersionFile: failed to delete version file for ${user}/${domain}@${index}: ${message}`);
    return false;
  }

  // Update metadata to maintain coherence
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

// Low-level: Set current version index
export async function setCurrentVersion(user: string, domain: string, index: number): Promise<boolean> {
  const data = await readSiteMetadata(user, domain);
  if (data === undefined) {
    console.error(`setCurrentVersion: site not found: ${user}/${domain}`);
    return false;
  }

  try {
    await Deno.stat(versionPath(user, domain, index));
  } catch {
    console.error(`setCurrentVersion: version ${index} does not exist for ${user}/${domain}`);
    return false;
  }

  data.currentIndex = index;
  data.enabled = true;
  await writeSiteMetadata(user, domain, data);
  return true;
}

// Low-level: Delete extracted site files
export async function deleteExtractedFiles(user: string, domain: string): Promise<void> {
  try {
    await Deno.remove(extractedDir(user, domain), { recursive: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete extracted site for ${user}/${domain}: ${message}`);
  }

  // Clear extracted flag in metadata
  const data = await readSiteMetadata(user, domain);
  if (data) {
    data.extracted = false;
    await writeSiteMetadata(user, domain, data);
  }
}

// Low-level: Delete entire site directory
export async function deleteSiteFiles(user: string, domain: string): Promise<void> {
  try {
    await Deno.remove(domainDir(user, domain), { recursive: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete site directory for ${user}/${domain}: ${message}`);
  }
}

// Low-level: Check if version file exists
export async function versionExists(user: string, domain: string, index: number): Promise<boolean> {
  try {
    await Deno.stat(versionPath(user, domain, index));
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to check version file for ${user}/${domain}@${index}: ${message}`);
    return false;
  }
}

// Low-level: Check if extracted site exists
export async function extractedSiteExists(user: string, domain: string): Promise<boolean> {
  const data = await readSiteMetadata(user, domain);
  if (!data?.extracted) return false;
  // Also check if the directory actually exists on disk
  const dir = extractedDir(user, domain);
  try {
    await Deno.stat(dir);
    // Also check if index.html exists
    const indexPath = extractedFilePath(user, domain, 'index.html');
    try {
      await Deno.stat(indexPath);
      return true;
    } catch {
      // index.html doesn't exist, treat as not extracted
      data.extracted = false;
      await writeSiteMetadata(user, domain, data);
      return false;
    }
  } catch {
    // Directory doesn't exist, update metadata
    data.extracted = false;
    await writeSiteMetadata(user, domain, data);
    return false;
  }
}

// Low-level: Read an extracted file
export async function readExtractedFile(user: string, domain: string, filePath: string): Promise<Deno.FsFile | undefined> {
  const fullPath = extractedFilePath(user, domain, filePath);
  try {
    return await Deno.open(fullPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read extracted file ${fullPath}: ${message}`);
    return undefined;
  }
}

// Low-level: Extract files to site directory
export async function extractFiles(user: string, domain: string, files: Record<string, Uint8Array>): Promise<void> {
  try {
    const targetDir = extractedDir(user, domain);
    await Deno.mkdir(targetDir, { recursive: true });

    // Detect common root folder (e.g., repo-main/ in GitHub zips)
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
          // Strip common root from all paths
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
      await Deno.mkdir(dir, { recursive: true });
      await Deno.writeFile(outPath, data);
    }

    // Update metadata to mark as extracted
    const data = await readSiteMetadata(user, domain);
    if (data) {
      data.extracted = true;
      await writeSiteMetadata(user, domain, data);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`extractFiles: extraction failed for ${user}/${domain}: ${message}`);
    await deleteExtractedFiles(user, domain);
  }
}

// Low-level: List all users
export async function listUsers(): Promise<string[]> {
  const users: string[] = [];
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.isDirectory && !entry.name.startsWith('.')) {
        // Check if it has a user.json file to confirm it's a user directory
        try {
          await Deno.stat(`${SITES_DIR}/${entry.name}/user.json`);
          users.push(entry.name);
        } catch {
          // Not a user directory, skip
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read sites directory: ${message}`);
  }
  return users;
}

// Low-level: List all domains for a user
export async function listDomains(user: string): Promise<string[]> {
  const domains: string[] = [];
  const userDir = `${SITES_DIR}/${user}`;
  try {
    for await (const entry of Deno.readDir(userDir)) {
      if (entry.isDirectory) {
        // Check if metadata.json exists in this directory
        try {
          await Deno.stat(metadataPath(user, entry.name));
          domains.push(entry.name);
        } catch {
          // Not a valid site directory, skip
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read user directory ${userDir}: ${message}`);
  }
  return domains;
}

// Low-level: Read active version contents
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

// Low-level: Open active version file handle
export async function openActiveVersion(user: string, domain: string): Promise<Deno.FsFile | undefined> {
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
