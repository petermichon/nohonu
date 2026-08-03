import * as sitesDb from '../../core/sites/db.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';


export async function checkDomain(user: string, rawDomain: string): Promise<boolean> {
  const domain = rawDomain.replace(/\.petermichon\.fr$/, '');
  if (!VALID_DOMAIN.test(domain)) return false;
  const data = await sitesDb.readSiteMetadata(user, domain);
  return !!data && data.currentIndex !== null;
}


