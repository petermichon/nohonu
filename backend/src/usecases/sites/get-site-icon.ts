import { readActiveVersion } from '../../core/sites/read-active-version.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { db } from '../../db.ts';
import { readZip } from '../../shared/zip.ts';


export async function getSiteIcon(
  domain: string,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const site = await db.site.findFirst({ where: { domain }, select: { userUsername: true } });
  const user = site?.userUsername ?? null;
  if (!user) return null;

  const data = await readSiteMetadata(user, domain);
  if (!data || !data.enabled || data.currentIndex === null) return null;

  const zipData = await readActiveVersion(user, domain);
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
