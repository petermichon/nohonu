import { VALID_SITE_ID } from '../../shared/paths.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';

export async function checkDomain(user: string, rawSiteId: string): Promise<boolean> {
  const siteId = rawSiteId.replace(/\.petermichon\.fr$/, '');
  if (!VALID_SITE_ID.test(siteId)) return false;
  const data = await readSiteMetadata(user, siteId);
  return !!data && data.currentIndex !== null;
}


