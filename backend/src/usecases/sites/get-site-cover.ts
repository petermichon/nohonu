import * as fs from 'node:fs/promises';
import * as sitesDb from '../../core/sites/db.ts';
import { findUserForDomain } from '../../core/sites/find-user-for-domain.ts';
import { coverImagePath } from '../../shared/paths.ts';


export async function getSiteCover(domain: string): Promise<Uint8Array | null> {
  const user = await findUserForDomain(domain);
  if (!user) return null;

  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || !data.coverImage) return null;

  try {
    return await fs.readFile(coverImagePath(user, domain));
  } catch {
    return null;
  }
}
