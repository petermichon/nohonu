import { error, json } from '../../shared/http.ts';
import { readSiteMetadata, readActiveVersion } from '../../services/sites-folder.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteInfo({ domain }: RouteContext): Promise<Response> {
  const data = await readSiteMetadata(domain);
  if (!data || data.currentIndex === null) {
    return error('Site not found', 404);
  }
  const version = await readActiveVersion(domain);
  if (!version) {
    return error('Site not found', 404);
  }
  return json({ domain, enabled: data.enabled });
}
