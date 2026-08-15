import { versionPath } from '../../shared/paths.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { site as siteTable } from '../../db/site.ts';
import { siteWhere } from '../../shared/site-where.ts';

import * as fs from 'node:fs/promises';






export async function downloadActiveVersion(
  user: string,
  siteId: string,
): Promise<{ data: Uint8Array; filename: string } | null> {
  const site = await siteTable.findUnique({ where: siteWhere(user, siteId), select: { userUsername: true } });
  const siteUser = site?.userUsername ?? null;
  if (!siteUser) return null;
  const meta = await readSiteMetadata(user, siteId);
  if (!meta || !meta.enabled || meta.currentIndex === null) return null;
  const data = await fs.readFile(versionPath(user, siteId, meta.currentIndex)).catch(() => undefined);
  if (!data) return null;
  return { data, filename: `${siteId}.zip` };
}
