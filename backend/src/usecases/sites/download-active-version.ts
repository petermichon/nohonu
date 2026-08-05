import * as fs from 'node:fs/promises';
import { db } from '../../db.ts';
import { versionPath } from '../../shared/paths.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

export async function downloadActiveVersion(
  domain: string,
): Promise<{ data: Uint8Array; filename: string } | null> {
  const site = await db.site.findFirst({ where: { domain }, select: { userUsername: true } });
  const user = site?.userUsername ?? null;
  if (!user) return null;
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const meta = record ? toSiteData(record) : undefined;
  if (!meta || !meta.enabled || meta.currentIndex === null) return null;
  const data = await fs.readFile(versionPath(user, domain, meta.currentIndex)).catch(() => undefined);
  if (!data) return null;
  return { data, filename: `${domain}.zip` };
}
