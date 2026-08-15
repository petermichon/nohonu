import { versionPath } from '../../shared/paths.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { readZip } from '../../shared/zip.ts';
import { site as siteTable } from '../../db/site.ts';
import { siteWhere } from '../../shared/site-where.ts';

import * as fs from 'node:fs/promises';







export async function getSiteIcon(
  user: string,
  siteId: string,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const site = await siteTable.findUnique({ where: siteWhere(user, siteId), select: { userUsername: true } });
  const siteUser = site?.userUsername ?? null;
  if (!siteUser) return null;

  const data = await readSiteMetadata(user, siteId);
  if (!data || !data.enabled || data.currentIndex === null) return null;

  const zipData = await fs.readFile(versionPath(user, siteId, data.currentIndex)).catch(() => undefined);
  if (!zipData) return null;

  const files = await readZip(zipData);

  const candidates = [
    { name: 'favicon.ico', type: 'image/x-icon' },
    { name: 'favicon.png', type: 'image/png' },
    { name: 'favicon.svg', type: 'image/svg+xml' },
  ];

  for (const { name, type } of candidates) {
    const fileData = files[name];
    if (fileData?.length) return { data: fileData, contentType: type };
  }

  return null;
}
