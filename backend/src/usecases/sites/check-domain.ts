import { VALID_DOMAIN } from '../../shared/node/paths.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';

export async function checkDomain(user: string, rawDomain: string): Promise<boolean> {
  const domain = rawDomain.replace(/\.petermichon\.fr$/, '');
  if (!VALID_DOMAIN.test(domain)) return false;
  const data = await readSiteMetadata(user, domain);
  return !!data && data.currentIndex !== null;
}


