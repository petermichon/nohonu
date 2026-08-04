import { db } from '../../db.ts';
import * as sitesDb from '../../core/sites/db.ts';
import * as storage from '../../core/sites/storage.ts';


export async function downloadActiveVersion(
  domain: string,
): Promise<{ data: Uint8Array; filename: string } | null> {
  const site = await db.site.findFirst({ where: { domain }, select: { userUsername: true } });
  const user = site?.userUsername ?? null;
  if (!user) return null;
  const meta = await sitesDb.readSiteMetadata(user, domain);
  if (!meta || !meta.enabled || meta.currentIndex === null) return null;
  const data = await storage.readActiveVersion(user, domain);
  if (!data) return null;
  return { data, filename: `${domain}.zip` };
}
