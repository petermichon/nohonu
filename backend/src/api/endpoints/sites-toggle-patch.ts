import { error, json } from '../../shared/http.ts';
import { deleteExtractedSite } from '../../services/sites-folder.ts';
import { readSiteMetadata, writeSiteMetadata } from '../../services/sites-folder.ts';
import type { RouteContext } from './sites-types.ts';

export async function toggleSite({ domain }: RouteContext): Promise<Response> {
  const data = await readSiteMetadata(domain);
  if (!data || data.currentIndex === null) {
    return error('Site not found', 404);
  }
  data.enabled = !data.enabled;
  await writeSiteMetadata(domain, data);
  if (!data.enabled) {
    await deleteExtractedSite(domain);
  }
  return json({ success: true, domain, enabled: data.enabled });
}
