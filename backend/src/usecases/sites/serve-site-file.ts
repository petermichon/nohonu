import { extractFiles } from '../../core/sites/extract-files.ts';
import { extractedSiteExists } from '../../core/sites/extracted-site-exists.ts';
import { readActiveVersion } from '../../core/sites/read-active-version.ts';
import { db } from '../../db.ts';
import { getContentType } from '../../shared/mime.ts';
import { extractedFilePath } from '../../shared/paths.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { readZip } from '../../shared/zip.ts';

import * as fs from 'node:fs/promises';








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
      const zipData = await readActiveVersion(user, domain);
      if (!zipData) return null;
      const files = await readZip(zipData);
      await extractFiles(user, domain, files);
    } catch {
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
