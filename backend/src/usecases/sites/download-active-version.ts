import * as sitesDb from '../../core/sites/db.ts';
import { findUserForDomain } from '../../core/sites/find-user-for-domain.ts';
import * as storage from '../../core/sites/storage.ts';


export async function downloadActiveVersion(
  domain: string,
): Promise<{ data: Uint8Array; filename: string } | null> {
  const user = await findUserForDomain(domain);
  if (!user) return null;
  const meta = await sitesDb.readSiteMetadata(user, domain);
  if (!meta || !meta.enabled || meta.currentIndex === null) return null;
  const data = await storage.readActiveVersion(user, domain);
  if (!data) return null;
  return { data, filename: `${domain}.zip` };
}
