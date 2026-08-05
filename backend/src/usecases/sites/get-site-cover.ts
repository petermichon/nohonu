import { db } from '../../db.ts';
import { coverImagePath } from '../../shared/paths.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import * as fs from 'node:fs/promises';




export async function getSiteCover(domain: string): Promise<Uint8Array | null> {
  const site = await db.site.findFirst({ where: { domain }, select: { userUsername: true } });
  const user = site?.userUsername ?? null;
  if (!user) return null;

  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const data = record ? toSiteData(record) : undefined;
  if (!data || !data.coverImage) return null;

  try {
    return await fs.readFile(coverImagePath(user, domain));
  } catch {
    return null;
  }
}
