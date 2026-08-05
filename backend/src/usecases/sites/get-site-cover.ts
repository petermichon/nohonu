import { coverImagePath } from '../../shared/paths.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { site as siteTable } from '../../db/site.ts';

import * as fs from 'node:fs/promises';




export async function getSiteCover(domain: string): Promise<Uint8Array | null> {
  const site = await siteTable.findFirst({ where: { domain }, select: { userUsername: true } });
  const user = site?.userUsername ?? null;
  if (!user) return null;

  const data = await readSiteMetadata(user, domain);
  if (!data || !data.coverImage) return null;

  try {
    return await fs.readFile(coverImagePath(user, domain));
  } catch {
    return null;
  }
}
