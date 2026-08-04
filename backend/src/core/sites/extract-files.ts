import { extractedDir, extractedFilePath } from '../../shared/paths.ts';
import { deleteExtractedFiles } from './delete-extracted-files.ts';
import { readSiteMetadata } from './read-site-metadata.ts';
import { writeSiteMetadata } from './write-site-metadata.ts';

import * as fs from 'node:fs/promises';






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
