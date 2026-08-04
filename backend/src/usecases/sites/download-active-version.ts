import { readActiveVersion } from '../../core/sites/read-active-version.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { db } from '../../db.ts';


export async function downloadActiveVersion(
  domain: string,
): Promise<{ data: Uint8Array; filename: string } | null> {
  const site = await db.site.findFirst({ where: { domain }, select: { userUsername: true } });
  const user = site?.userUsername ?? null;
  if (!user) return null;
  const meta = await readSiteMetadata(user, domain);
  if (!meta || !meta.enabled || meta.currentIndex === null) return null;
  const data = await readActiveVersion(user, domain);
  if (!data) return null;
  return { data, filename: `${domain}.zip` };
}
