import { SITES_DIR, SiteData } from '../../shared/paths.ts';

// Path helpers for new domain-based structure
export function domainDir(domain: string): string {
  return `${SITES_DIR}/${domain}`;
}

function metadataPath(domain: string): string {
  return `${domainDir(domain)}/metadata.json`;
}

export function versionsDir(domain: string): string {
  return `${domainDir(domain)}/versions`;
}

export function versionPath(domain: string, index: number): string {
  return `${versionsDir(domain)}/${index}.zip`;
}

function extractedDir(domain: string): string {
  return `${domainDir(domain)}/extracted`;
}

function extractedFilePath(domain: string, filePath: string): string {
  return `${extractedDir(domain)}/${filePath}`;
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
export async function readSiteMetadata(domain: string): Promise<SiteData | undefined> {
  let content: string;
  try {
    content = await Deno.readTextFile(metadataPath(domain));
  } catch (_error) {
    // File not found is expected for new sites, don't log error
    return undefined;
  }

  try {
    const parsed = JSON.parse(content) as Partial<SiteData>;
    return { ...DEFAULT_DATA, ...parsed };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to parse metadata file for ${domain}: ${message}`);
    return undefined;
  }
}

// Low-level: Write site metadata
export async function writeSiteMetadata(domain: string, data: SiteData): Promise<void> {
  if (data.nextIndex < 1) {
    console.error(`writeSiteMetadata: nextIndex must be >= 1 for ${domain}, got ${data.nextIndex}`);
    return;
  }
  if (data.currentIndex !== null) {
    try {
      await Deno.stat(versionPath(domain, data.currentIndex));
    } catch {
      console.error(`writeSiteMetadata: currentIndex ${data.currentIndex} has no version file for ${domain}`);
      return;
    }
  }
  await Deno.writeTextFile(metadataPath(domain), JSON.stringify(data, null, 2));
}

// Low-level: Open a version file handle
export async function openVersion(domain: string, index: number): Promise<Deno.FsFile> {
  return await Deno.open(versionPath(domain, index));
}

// Low-level: Read version file contents
export async function readVersion(domain: string, index: number): Promise<Uint8Array> {
  return await Deno.readFile(versionPath(domain, index));
}

// Low-level: Delete a version file and update metadata
export async function deleteVersionFile(domain: string, index: number): Promise<boolean> {
  const data = await readSiteMetadata(domain);
  if (data === undefined) {
    console.error(`deleteVersionFile: site not found: ${domain}`);
    return false;
  }

  try {
    await Deno.remove(versionPath(domain, index));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`deleteVersionFile: failed to delete version file for ${domain}@${index}: ${message}`);
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
  await writeSiteMetadata(domain, data);
  return true;
}

// Low-level: Set current version index
export async function setCurrentVersion(domain: string, index: number): Promise<boolean> {
  const data = await readSiteMetadata(domain);
  if (data === undefined) {
    console.error(`setCurrentVersion: site not found: ${domain}`);
    return false;
  }

  try {
    await Deno.stat(versionPath(domain, index));
  } catch {
    console.error(`setCurrentVersion: version ${index} does not exist for ${domain}`);
    return false;
  }

  data.currentIndex = index;
  data.enabled = true;
  await writeSiteMetadata(domain, data);
  return true;
}

// Low-level: Delete extracted site files
export async function deleteExtractedFiles(domain: string): Promise<void> {
  try {
    await Deno.remove(extractedDir(domain), { recursive: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete extracted site for ${domain}: ${message}`);
  }

  // Clear extracted flag in metadata
  const data = await readSiteMetadata(domain);
  if (data) {
    data.extracted = false;
    await writeSiteMetadata(domain, data);
  }
}

// Low-level: Delete entire site directory
export async function deleteSiteFiles(domain: string): Promise<void> {
  try {
    await Deno.remove(domainDir(domain), { recursive: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete site directory for ${domain}: ${message}`);
  }
}

// Low-level: Check if version file exists
export async function versionExists(domain: string, index: number): Promise<boolean> {
  try {
    await Deno.stat(versionPath(domain, index));
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to check version file for ${domain}@${index}: ${message}`);
    return false;
  }
}

// Low-level: Check if extracted site exists
export async function extractedSiteExists(domain: string): Promise<boolean> {
  const data = await readSiteMetadata(domain);
  return data?.extracted ?? false;
}

// Low-level: Read an extracted file
export async function readExtractedFile(domain: string, filePath: string): Promise<Deno.FsFile | undefined> {
  const fullPath = extractedFilePath(domain, filePath);
  try {
    return await Deno.open(fullPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read extracted file ${fullPath}: ${message}`);
    return undefined;
  }
}

// Low-level: Extract files to site directory
export async function extractFiles(domain: string, files: Record<string, Uint8Array>): Promise<void> {
  try {
    await Deno.mkdir(extractedDir(domain), { recursive: true });

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
      const outPath = extractedFilePath(domain, relativePath);
      const dir = outPath.substring(0, outPath.lastIndexOf('/'));
      await Deno.mkdir(dir, { recursive: true });
      await Deno.writeFile(outPath, data);
    }

    // Update metadata to mark as extracted
    const data = await readSiteMetadata(domain);
    if (data) {
      data.extracted = true;
      await writeSiteMetadata(domain, data);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`extractFiles: extraction failed for ${domain}: ${message}`);
    await deleteExtractedFiles(domain);
  }
}

// Low-level: List all domains with metadata
export async function listDomains(): Promise<string[]> {
  const domains: string[] = [];
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.isDirectory) {
        // Check if metadata.json exists in this directory
        try {
          await Deno.stat(metadataPath(entry.name));
          domains.push(entry.name);
        } catch {
          // Not a valid site directory, skip
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read sites directory: ${message}`);
  }
  return domains;
}

// Low-level: Read active version contents
export async function readActiveVersion(domain: string): Promise<Uint8Array | undefined> {
  const data = await readSiteMetadata(domain);
  if (!data || data.currentIndex === null) {
    return undefined;
  }
  try {
    return await readVersion(domain, data.currentIndex);
  } catch {
    return undefined;
  }
}

// Low-level: Open active version file handle
export async function openActiveVersion(domain: string): Promise<Deno.FsFile | undefined> {
  const data = await readSiteMetadata(domain);
  if (!data || data.currentIndex === null) {
    return undefined;
  }
  try {
    return await openVersion(domain, data.currentIndex);
  } catch {
    return undefined;
  }
}
