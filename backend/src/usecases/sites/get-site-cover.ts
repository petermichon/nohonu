import * as fs from 'node:fs/promises';
import * as sitesDb from '../../core/sites/db.ts';
import { coverImagePath } from '../../shared/paths.ts';


export async function getSiteCover(user: string, domain: string): Promise<Uint8Array | null> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || !data.coverImage) return null;

  try {
    return await fs.readFile(coverImagePath(user, domain));
  } catch {
    return null;
  }
}


