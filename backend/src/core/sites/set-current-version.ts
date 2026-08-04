import * as fs from 'node:fs/promises';
import { readSiteMetadata } from './read-site-metadata.ts';
import { versionPath } from './version-path.ts';
import { writeSiteMetadata } from './write-site-metadata.ts';

export async function setCurrentVersion(user: string, domain: string, index: number): Promise<boolean> {
  const data = await readSiteMetadata(user, domain);
  if (data === undefined) {
    console.error(`setCurrentVersion: site not found: ${user}/${domain}`);
    return false;
  }

  try {
    await fs.stat(versionPath(user, domain, index));
  } catch {
    console.error(`setCurrentVersion: version ${index} does not exist for ${user}/${domain}`);
    return false;
  }

  data.currentIndex = index;
  data.enabled = true;
  await writeSiteMetadata(user, domain, data);
  return true;
}
