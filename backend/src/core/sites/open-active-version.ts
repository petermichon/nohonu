import * as fs from 'node:fs/promises';
import { openVersion } from './open-version.ts';
import { readSiteMetadata } from './read-site-metadata.ts';

export async function openActiveVersion(user: string, domain: string): Promise<fs.FileHandle | undefined> {
  const data = await readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) return undefined;
  try {
    return await openVersion(user, domain, data.currentIndex);
  } catch {
    return undefined;
  }
}
