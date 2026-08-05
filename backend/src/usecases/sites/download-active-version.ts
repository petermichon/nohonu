import { site as siteTable } from '../../db/site.ts';
import { versionPath } from '../../shared/paths.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import * as fs from 'node:fs/promises';






export async function downloadActiveVersion(
  domain: string,
): Promise<{ data: Uint8Array; filename: string } | null> {
  const site = await siteTable.findFirst({ where: { domain }, select: { userUsername: true } });
  const user = site?.userUsername ?? null;
  if (!user) return null;
  const record = await siteTable.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const meta = record ? toSiteData(record) : undefined;
  if (!meta || !meta.enabled || meta.currentIndex === null) return null;
  const data = await fs.readFile(versionPath(user, domain, meta.currentIndex)).catch(() => undefined);
  if (!data) return null;
  return { data, filename: `${domain}.zip` };
}
