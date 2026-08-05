import { versionPath } from '../../shared/node/paths.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { site as siteTable } from '../../db/site.ts';

import * as fs from 'node:fs/promises';






export async function downloadActiveVersion(
  domain: string,
): Promise<{ data: Uint8Array; filename: string } | null> {
  const site = await siteTable.findFirst({ where: { domain }, select: { userUsername: true } });
  const user = site?.userUsername ?? null;
  if (!user) return null;
  const meta = await readSiteMetadata(user, domain);
  if (!meta || !meta.enabled || meta.currentIndex === null) return null;
  const data = await fs.readFile(versionPath(user, domain, meta.currentIndex)).catch(() => undefined);
  if (!data) return null;
  return { data, filename: `${domain}.zip` };
}
