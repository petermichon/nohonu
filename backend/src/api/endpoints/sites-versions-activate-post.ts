import { error, json } from '../../shared/http.ts';
import { SITES_DIR, fileExists, getVersionPath } from '../../shared/paths.ts';
import { loadSiteData, saveSiteData } from '../../services/meta.ts';
import type { RouteContext } from './sites-types.ts';

export async function activateVersion({ domain, timestamp: index }: RouteContext): Promise<Response> {
  if (!index || isNaN(index)) {
    return error('Invalid index');
  }
  if (!(await fileExists(getVersionPath(domain, index)))) {
    return error('Version not found', 404);
  }

  const data = await loadSiteData(domain);
  data.currentIndex = index;
  data.enabled = true;
  await saveSiteData(domain, data);
  try {
    await Deno.remove(`${SITES_DIR}/${domain}`, { recursive: true });
  } catch {
    /* already gone */
  }
  return json({ success: true, domain, index });
}
