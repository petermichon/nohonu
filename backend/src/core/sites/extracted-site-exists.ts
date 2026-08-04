import * as fs from 'node:fs/promises';
import { extractedDir } from './extracted-dir.ts';
import { extractedFilePath } from './extracted-file-path.ts';
import { readSiteMetadata } from './read-site-metadata.ts';
import { writeSiteMetadata } from './write-site-metadata.ts';

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
