import { readSiteMetadata } from './read-site-metadata.ts';
import { readVersion } from './read-version.ts';

export async function readActiveVersion(user: string, domain: string): Promise<Uint8Array | undefined> {
  const data = await readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) return undefined;
  try {
    return await readVersion(user, domain, data.currentIndex);
  } catch {
    return undefined;
  }
}
