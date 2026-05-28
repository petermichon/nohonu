import { error, json } from '../../shared/http.ts';
import { SITES_DIR } from '../../shared/paths.ts';
import { loadSiteData, saveSiteData } from '../../services/meta.ts';
import type { RouteContext } from './sites-types.ts';

export async function toggleSite({ domain }: RouteContext): Promise<Response> {
  const data = await loadSiteData(domain);
  if (data.currentIndex === null) {
    return error('Site not found', 404);
  }
  data.enabled = !data.enabled;
  await saveSiteData(domain, data);
  if (!data.enabled) {
    try {
      await Deno.remove(`${SITES_DIR}/${domain}`, { recursive: true });
    } catch {
      /* already gone */
    }
  }
  return json({ success: true, domain, enabled: data.enabled });
}
