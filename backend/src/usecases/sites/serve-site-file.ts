import * as sitesDb from '../../core/sites/db.ts';
import * as storage from '../../core/sites/storage.ts';
import * as fsOps from '../../core/sites/fs.ts';
import { readZip } from '../../shared/zip.ts';
import { getContentType } from '../../shared/mime.ts';


export async function serveSiteFile(
  user: string,
  domain: string,
  filePath: string,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const siteData = await sitesDb.readSiteMetadata(user, domain);
  if (!siteData) return null;

  if (!(await storage.extractedSiteExists(user, domain))) {
    if (!siteData.enabled || siteData.currentIndex === null) return null;

    try {
      const zipData = await storage.readActiveVersion(user, domain);
      if (!zipData) return null;
      const files = await readZip(zipData);
      await storage.extractFiles(user, domain, files);
    } catch {
      return null;
    }
  }

  const fileHandle = await fsOps.readExtractedFile(user, domain, filePath);
  if (!fileHandle) return null;

  const data = await fileHandle.readFile();
  await fileHandle.close();

  const parts = filePath.split('.');
  const ext = parts.pop() ?? '';
  return { data, contentType: getContentType(ext) };
}


