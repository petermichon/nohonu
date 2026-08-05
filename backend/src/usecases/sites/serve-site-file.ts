import * as fs from 'node:fs/promises';
import { deleteExtractedFiles } from '../../core/sites/delete-extracted-files.ts';
import { extractedSiteExists } from '../../core/sites/extracted-site-exists.ts';
import { db } from '../../db.ts';
import { getContentType } from '../../shared/mime.ts';
import { extractedDir, extractedFilePath, versionPath } from '../../shared/paths.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { stripCommonRoot } from '../../shared/strip-common-root.ts';
import { readZip } from '../../shared/zip.ts';


export async function serveSiteFile(
  user: string,
  domain: string,
  filePath: string,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const siteData = record ? toSiteData(record) : undefined;
  if (!siteData) return null;

  if (!(await extractedSiteExists(user, domain))) {
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
      const extractionRecord = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
      const extractionData = extractionRecord ? toSiteData(extractionRecord) : undefined;
      if (extractionData) {
        extractionData.extracted = true;
        await db.site.upsert(toSiteUpsert(user, domain, extractionData));
      }
    } catch {
      await deleteExtractedFiles(user, domain);
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
