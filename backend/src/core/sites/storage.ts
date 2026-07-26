import * as fs from 'node:fs/promises';
import { db } from '../../db.ts';
import { SiteData, domainDir } from '../../shared/paths.ts';


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

type SiteRecord = {
  id: string; siteId: string; domain: string; userUsername: string;
  nextIndex: number; currentIndex: number | null; enabled: boolean;
  account: string | null; displayName: string | null;
  subdomain: string | null; coverImage: string | null;
  lastDeployedAt: number | null; starCount: number; extracted: boolean;
  versions: { index: number; type: string; repo: string | null; branch: string | null; createdAt: number }[];
  repoHistories: { repo: string; branch: string; lastUsed: number }[];
  customDomains: { domain: string; verified: boolean }[];
  starredBy: { username: string }[];
};

function toSiteData(record: SiteRecord): SiteData {
  const versions: SiteData['versions'] = {};
  for (const v of record.versions) {
    const source: SiteData['versions'][string]['source'] = v.type === 'github'
      ? { type: 'github', repo: v.repo ?? '', branch: v.branch ?? '' }
      : { type: 'upload' };
    versions[String(v.index)] = { source, createdAt: v.createdAt };
  }

  return {
    siteId: record.siteId,
    nextIndex: record.nextIndex,
    currentIndex: record.currentIndex,
    enabled: record.enabled,
    account: record.account ?? undefined,
    displayName: record.displayName ?? undefined,
    repoHistory: record.repoHistories.map((r) => ({
      repo: r.repo,
      branch: r.branch,
      lastUsed: r.lastUsed,
    })),
    versions,
    extracted: record.extracted,
    customDomains: record.customDomains.map((c) => ({
      domain: c.domain,
      verified: c.verified,
    })),
    subdomain: record.subdomain ?? undefined,
    coverImage: record.coverImage ?? undefined,
    lastDeployedAt: record.lastDeployedAt ?? undefined,
    starCount: record.starCount,
    starredBy: record.starredBy.map((s) => s.username),
  };
}

function siteWhere(user: string, domain: string): { userUsername_domain: { userUsername: string; domain: string } } {
  return { userUsername_domain: { userUsername: user, domain } };
}

export async function readSiteMetadata(user: string, domain: string): Promise<SiteData | undefined> {
  const record = await db.site.findUnique({
    where: siteWhere(user, domain),
    include: { versions: true, repoHistories: true, customDomains: true, starredBy: true },
  });
  if (!record) return undefined;
  return toSiteData(record);
}

export async function writeSiteMetadata(user: string, domain: string, data: SiteData): Promise<void> {
  if (data.nextIndex < 1) {
    console.error(`writeSiteMetadata: nextIndex must be >= 1 for ${user}/${domain}, got ${data.nextIndex}`);
    return;
  }

  const siteId = data.siteId || `${user}-${domain}`;

  await db.site.upsert({
    where: siteWhere(user, domain),
    create: {
      siteId,
      domain,
      userUsername: user,
      nextIndex: data.nextIndex,
      currentIndex: data.currentIndex,
      enabled: data.enabled,
      account: data.account ?? user,
      displayName: data.displayName ?? domain,
      subdomain: data.subdomain,
      coverImage: data.coverImage,
      lastDeployedAt: data.lastDeployedAt,
      starCount: data.starCount ?? 0,
      extracted: data.extracted,
    },
    update: {
      nextIndex: data.nextIndex,
      currentIndex: data.currentIndex,
      enabled: data.enabled,
      account: data.account ?? user,
      displayName: data.displayName ?? domain,
      subdomain: data.subdomain,
      coverImage: data.coverImage,
      lastDeployedAt: data.lastDeployedAt,
      starCount: data.starCount ?? 0,
      extracted: data.extracted,
    },
  });

  const dbSite = await db.site.findUnique({ where: siteWhere(user, domain), select: { id: true } });
  if (!dbSite) return;

  const siteIdFk = dbSite.id;

  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    const existingVersion = await db.version.findFirst({ where: { siteId: siteIdFk, index } });
    const sourceData: { type: string; repo: string | null; branch: string | null } = {
      type: entry.source.type,
      repo: null,
      branch: null,
    };
    if (entry.source.type === 'github') {
      sourceData.repo = entry.source.repo;
      sourceData.branch = entry.source.branch;
    }
    if (existingVersion) {
      await db.version.update({ where: { id: existingVersion.id }, data: { ...sourceData, createdAt: entry.createdAt } });
    } else {
      await db.version.create({ data: { index, createdAt: entry.createdAt, siteId: siteIdFk, ...sourceData } });
    }
  }

  const versionIndices = new Set(Object.keys(data.versions).map(Number));
  await db.version.deleteMany({ where: { siteId: siteIdFk, index: { notIn: Array.from(versionIndices) } } });

  await db.repoHistory.deleteMany({ where: { siteId: siteIdFk } });
  if (data.repoHistory.length > 0) {
    await db.repoHistory.createMany({
      data: data.repoHistory.map((r) => ({
        repo: r.repo,
        branch: r.branch,
        lastUsed: r.lastUsed,
        siteId: siteIdFk,
      })),
    });
  }

  await db.customDomain.deleteMany({ where: { siteId: siteIdFk } });
  if (data.customDomains && data.customDomains.length > 0) {
    await db.customDomain.createMany({
      data: data.customDomains.map((c) => ({
        domain: c.domain,
        verified: c.verified,
        siteId: siteIdFk,
      })),
    });
  }

  await db.starredBy.deleteMany({ where: { siteId: siteIdFk } });
  if (data.starredBy && data.starredBy.length > 0) {
    await db.starredBy.createMany({
      data: data.starredBy.map((username) => ({
        username,
        siteId: siteIdFk,
      })),
    });
  }
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
  await db.site.deleteMany({ where: { AND: { userUsername: user, domain } } });
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

export async function listUsers(): Promise<string[]> {
  const users = await db.user.findMany({ select: { username: true } });
  return users.map((u) => u.username);
}

export async function listDomains(user: string): Promise<string[]> {
  const sites = await db.site.findMany({
    where: { userUsername: user },
    select: { domain: true },
  });
  return sites.map((s) => s.domain);
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
