import { coverImagePath } from '../../shared/paths.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { site as siteTable } from '../../db/site.ts';
import { siteWhere } from '../../shared/site-where.ts';

import * as fs from 'node:fs/promises';




export async function getSiteCover(user: string, siteId: string): Promise<Uint8Array | null> {
  const site = await siteTable.findUnique({ where: siteWhere(user, siteId), select: { userUsername: true } });
  const siteUser = site?.userUsername ?? null;
  if (!siteUser) return null;

  const data = await readSiteMetadata(user, siteId);
  if (!data || !data.coverImage) return null;

  try {
    return await fs.readFile(coverImagePath(user, siteId));
  } catch {
    return null;
  }
}
