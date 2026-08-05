import * as fs from 'node:fs/promises';
import { customDomain } from '../../db/custom-domain.ts';
import { site } from '../../db/site.ts';
import { user } from '../../db/user.ts';
import { recordHit } from '../../memory/record-hit.ts';
import { getContentType } from '../../shared/mime.ts';
import { extractedDir, extractedFilePath, fileExists, versionPath, VALID_DOMAIN } from '../../shared/paths.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { stripCommonRoot } from '../../shared/strip-common-root.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { readZip } from '../../shared/zip.ts';

async function resolveDomainAndServe(
  host: string,
  path: string,
): Promise<{ user: string; domain: string; filePath: string } | null> {
  console.assert(typeof host === 'string' && host.length > 0, 'host must be a non-empty string');
  console.assert(typeof path === 'string', 'path must be a string');

  // Check custom domain registry first
  const customDomainRecord = await customDomain.findFirst({ where: { domain: host, verified: true }, select: { siteId: true } });
  const mappedSite = customDomainRecord ? await site.findUnique({ where: { id: customDomainRecord.siteId }, select: { domain: true } }) : null;
  const mappedDomain = mappedSite?.domain;
  if (mappedDomain) {
    const siteRecord = await site.findFirst({ where: { domain: mappedDomain }, select: { userUsername: true } });
    const siteUser = siteRecord?.userUsername ?? null;
    if (siteUser) {
      const filePath = path === '/' ? '/index.html' : path;
      return { user: siteUser, domain: mappedDomain, filePath };
    }
  }

  // Check for subdomain-based routing
  const subdomainMatch = host.match(/^([^.]+)\./);
  if (subdomainMatch && subdomainMatch[1] && !['www'].includes(subdomainMatch[1])) {
    const subdomain = subdomainMatch[1];
    // Find which site has this subdomain in its metadata
    const users = (await user.findMany({ select: { username: true } })).map((u) => u.username);
    for (const siteUser of users) {
      const domains = (await site.findMany({ where: { userUsername: siteUser }, select: { domain: true } })).map((s) => s.domain);
      for (const domain of domains) {
        const record = await site.findUnique({ where: siteWhere(siteUser, domain), include: SITE_INCLUDE });
        const info = record ? toSiteData(record) : undefined;
        if (info && info.subdomain === subdomain && info.currentIndex !== null) {
          const filePath = path === '/' ? '/index.html' : path;
          return { user: siteUser, domain, filePath };
        }
      }
    }
  }

  if (path.length > 1) {
    const parts = path.split('/').filter(Boolean);
    const potential = parts[0];
    if (potential && VALID_DOMAIN.test(potential)) {
      const siteRecord = await site.findFirst({ where: { domain: potential }, select: { userUsername: true } });
      const siteUser = siteRecord?.userUsername ?? null;
      if (siteUser) {
        const record = await site.findUnique({ where: siteWhere(siteUser, potential), include: SITE_INCLUDE });
        const info = record ? toSiteData(record) : undefined;
        if (info && info.currentIndex !== null) {
          const domain = potential;
          const rest = parts.slice(1).join('/');
          const filePath = rest !== '' ? '/' + rest : '/index.html';
          return { user: siteUser, domain, filePath };
        }
      }
    }
  }

  return null;
}

async function serveSiteFile(
  user: string,
  domain: string,
  filePath: string,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const record = await site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const siteData = record ? toSiteData(record) : undefined;
  if (!siteData) return null;

  const extractedReady = siteData.extracted
    && await fileExists(extractedDir(user, domain))
    && await fileExists(extractedFilePath(user, domain, 'index.html'));
  if (!extractedReady) {
    if (siteData.extracted) {
      await site.updateMany({ where: { AND: { userUsername: user, domain } }, data: { extracted: false } });
    }
    if (!siteData.enabled || siteData.currentIndex === null) return null;

    try {
      const zipData = await fs.readFile(versionPath(user, domain, siteData.currentIndex));
      if (!zipData) return null;
      const files = await readZip(zipData);
      const stripped = stripCommonRoot(files);
      if (stripped === null) return null;
      await fs.mkdir(extractedDir(user, domain), { recursive: true });
      for (const [relativePath, data] of Object.entries(stripped)) {
        if (relativePath.includes('..') || relativePath.startsWith('/')) continue;
        const outPath = extractedFilePath(user, domain, relativePath);
        const dir = outPath.substring(0, outPath.lastIndexOf('/'));
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(outPath, data);
      }
      const extractionRecord = await site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
      const extractionData = extractionRecord ? toSiteData(extractionRecord) : undefined;
      if (extractionData) {
        extractionData.extracted = true;
        await site.upsert(toSiteUpsert(user, domain, extractionData));
      }
    } catch {
      try {
        await fs.rm(extractedDir(user, domain), { recursive: true, force: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Failed to delete extracted site for ${user}/${domain}: ${message}`);
      }
      await site.updateMany({ where: { AND: { userUsername: user, domain } }, data: { extracted: false } });
      return null;
    }
  }

  const fullPath = extractedFilePath(user, domain, filePath);
  let fileHandle: fs.FileHandle | undefined;
  try {
    fileHandle = await fs.open(fullPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read extracted file ${fullPath}: ${message}`);
  }
  if (!fileHandle) return null;

  const data = await fileHandle.readFile();
  await fileHandle.close();

  const parts = filePath.split('.');
  const ext = parts.pop() ?? '';
  return { data, contentType: getContentType(ext) };
}

export async function serveRequest(
  host: string,
  path: string,
  ip: string,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const resolved = await resolveDomainAndServe(host, path);
  if (!resolved) return null;

  const result = await serveSiteFile(resolved.user, resolved.domain, resolved.filePath);
  if (!result) return null;

  if (result.contentType === 'text/html') {
    recordHit(resolved.domain, ip);
  }
  return result;
}
