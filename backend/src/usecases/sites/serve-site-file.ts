import * as fs from 'node:fs/promises';
import { site } from '../../db/site.ts';
import { getContentType } from '../../shared/mime.ts';
import { extractedDir, extractedFilePath, fileExists, versionPath } from '../../shared/paths.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { stripCommonRoot } from '../../shared/strip-common-root.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { readZip } from '../../shared/zip.ts';

export async function serveSiteFile(
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
