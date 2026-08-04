import * as fs from 'node:fs/promises';
import { extractedDir } from './extracted-dir.ts';
import { readSiteMetadata } from './read-site-metadata.ts';
import { writeSiteMetadata } from './write-site-metadata.ts';

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
