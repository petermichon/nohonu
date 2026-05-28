import { SITES_DIR, SiteData } from '../shared/paths.ts';

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

// used in:
//   - sites-meta-patch.ts
//   - sites-list-get.ts
//   - sites-versions-activate-post.ts
//   - sites-toggle-patch.ts
//   - sites-versions-upload-post.ts
//   - sites-versions-get.ts
//   - sites-versions-delete.ts
//   - check-domain-get.ts
//   - get.ts
//   - sites-versions-github-post.ts
//   - sites-info-get.ts (getSiteInfo)
//   - sites-info-download.ts (downloadSite)
//   - sites-info-icon.ts (getSiteIcon)
//   - sites-info-meta.ts (getSiteMeta)
//   - sites-info-repos.ts (getSiteRepos)
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

// used in:
//   - sites-toggle-patch.ts
//   - sites-versions-delete.ts (called from deleteVersion)
//   - sites-versions-github-post.ts (2x)
//   - sites-versions-upload-post.ts
//   - sites-versions-activate-post.ts
//   - sites-meta-patch.ts
export async function writeSiteMetadata(domain: string, data: SiteData): Promise<void> {
  // Validate coherence: if currentIndex is set, the version file must exist
  if (data.currentIndex !== null) {
    try {
      await Deno.stat(versionPath(domain, data.currentIndex));
    } catch {
      throw new Error(`Cannot set currentIndex to ${data.currentIndex}: version file does not exist`);
    }
  }
  await Deno.writeTextFile(metadataPath(domain), JSON.stringify(data, null, 2));
}

// used in:
//   - sites-versions-get.ts (download specific version)
export async function openVersion(domain: string, index: number): Promise<Deno.FsFile> {
  return await Deno.open(versionPath(domain, index));
}

// used in:
//   - internal (no direct endpoint usage)
export async function readVersion(domain: string, index: number): Promise<Uint8Array> {
  return await Deno.readFile(versionPath(domain, index));
}

// used in:
//   - sites-versions-delete.ts (refactored to update metadata)
export async function deleteVersion(domain: string, index: number): Promise<void> {
  const data = await readSiteMetadata(domain);
  if (!data) {
    throw new Error(`Site not found: ${domain}`);
  }

  try {
    await Deno.remove(versionPath(domain, index));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to delete version file for ${domain}@${index}: ${message}`);
  }

  // Update metadata to maintain coherence
  delete data.versions[index];
  if (data.currentIndex === index) {
    // Find the next highest version to set as current
    const versionIndices = Object.keys(data.versions)
      .map(Number)
      .sort((a, b) => b - a);
    data.currentIndex = versionIndices.length > 0 ? versionIndices[0] : null;
  }
  await writeSiteMetadata(domain, data);
}

// used in:
//   - sites-versions-activate-post.ts (called from endpoint)
export async function activateVersion(domain: string, index: number): Promise<void> {
  const data = await readSiteMetadata(domain);
  if (!data) {
    throw new Error(`Site not found: ${domain}`);
  }

  // Validate version exists
  try {
    await Deno.stat(versionPath(domain, index));
  } catch {
    throw new Error(`Version ${index} does not exist for ${domain}`);
  }

  // Update metadata
  data.currentIndex = index;
  data.enabled = true;
  await writeSiteMetadata(domain, data);

  // Delete old extracted site to force re-extraction with new version
  await deleteExtractedSite(domain);
}

// used in:
//   - sites-versions-activate-post.ts (called from activateVersion)
//   - sites-toggle-patch.ts
//   - extractSite (cleanup on failure)
export async function deleteExtractedSite(domain: string): Promise<void> {
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

// used in:
//   - sites-delete.ts (delete entire site)
export async function deleteAllSiteFiles(domain: string): Promise<void> {
  try {
    await Deno.remove(domainDir(domain), { recursive: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete site directory for ${domain}: ${message}`);
  }
}

// used in:
//   - sites-versions-delete.ts
//   - sites-versions-activate-post.ts
//   - sites-versions-get.ts
//   - get.ts
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

// used in:
//   - get.ts (ensureSiteExtracted)
export async function extractedSiteExists(domain: string): Promise<boolean> {
  const data = await readSiteMetadata(domain);
  return data?.extracted ?? false;
}

// used in:
//   - get.ts (serveStatic)
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

// used in:
//   - get.ts (ensureSiteExtracted)
export async function extractSite(domain: string, files: Record<string, Uint8Array>): Promise<void> {
  try {
    await Deno.mkdir(extractedDir(domain), { recursive: true });

    // Detect common root folder (e.g., repo-main/ in GitHub zips)
    const paths = Object.keys(files);
    if (paths.length > 0) {
      const firstPath = paths[0];
      const firstSlashIndex = firstPath.indexOf('/');
      if (firstSlashIndex !== -1) {
        const commonRoot = firstPath.substring(0, firstSlashIndex + 1);
        const allHaveRoot = paths.every((p) => p.startsWith(commonRoot));
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
  } catch {
    // Clean up partial extraction on failure
    await deleteExtractedSite(domain);
    throw new Error('Extraction failed');
  }
}

// used in:
//   - scheduler.ts
//   - sites-list-get.ts
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

// --- Composed functions (built from core operations) ---

// used in:
//   - get.ts (ensureSiteExtracted)
//   - sites-info-get.ts (getSiteInfo)
//   - sites-info-icon.ts (getSiteIcon)
//   - check-domain-get.ts
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

// used in:
//   - sites-info-download.ts (downloadSite)
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
