import * as fs from 'node:fs/promises';
import { readActiveVersion } from '../../core/sites/read-active-version.ts';
import { extractedSiteExists } from '../../core/sites/extracted-site-exists.ts';
import { extractFiles } from '../../core/sites/extract-files.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { extractedFilePath } from '../../shared/paths.ts';
import { readZip } from '../../shared/zip.ts';
import { getContentType } from '../../shared/mime.ts';


export async function serveSiteFile(
  user: string,
  domain: string,
  filePath: string,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const siteData = await readSiteMetadata(user, domain);
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
