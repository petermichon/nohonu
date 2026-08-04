import { versionPath } from '../../shared/paths.ts';
import { readSiteMetadata } from './read-site-metadata.ts';
import { writeSiteMetadata } from './write-site-metadata.ts';

import * as fs from 'node:fs/promises';




export async function deleteVersionFile(user: string, domain: string, index: number): Promise<boolean> {
  const data = await readSiteMetadata(user, domain);
  if (data === undefined) {
    console.error(`deleteVersionFile: site not found: ${user}/${domain}`);
    return false;
  }

  try {
    await fs.unlink(versionPath(user, domain, index));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`deleteVersionFile: failed to delete version file for ${user}/${domain}@${index}: ${message}`);
    return false;
  }

  delete data.versions[index];
  if (data.currentIndex === index) {
    const versionIndices = Object.keys(data.versions)
      .map(Number)
      .sort((a, b) => {
        return b - a;
      });
    data.currentIndex = versionIndices.length > 0 ? (versionIndices[0] as number) : null;
  }
  await writeSiteMetadata(user, domain, data);
  return true;
}
