import * as fs from 'node:fs/promises';
import { readSiteMetadata } from './read-site-metadata.ts';
import { versionPath } from '../../shared/paths.ts';

export async function readActiveVersion(user: string, domain: string): Promise<Uint8Array | undefined> {
  const data = await readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) return undefined;
  try {
    return await fs.readFile(versionPath(user, domain, data.currentIndex));
  } catch {
    return undefined;
  }
}
