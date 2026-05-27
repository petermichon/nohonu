import { error, json } from '../../shared/http.ts';
import { SITES_DIR, fileExists, getCurrentVersionPath } from '../../shared/paths.ts';
import type { RouteContext } from './sites-types.ts';

export async function toggleSite({ domain }: RouteContext): Promise<Response> {
  const enabledPath = getCurrentVersionPath(domain, true);
  const disabledPath = getCurrentVersionPath(domain, false);

  if (await fileExists(enabledPath)) {
    await Deno.rename(enabledPath, disabledPath);
    try {
      await Deno.remove(`${SITES_DIR}/${domain}`, { recursive: true });
    } catch {
      /* already gone */
    }
    return json({ success: true, domain, enabled: false });
  }
  if (await fileExists(disabledPath)) {
    await Deno.rename(disabledPath, enabledPath);
    return json({ success: true, domain, enabled: true });
  }
  return error('Site not found', 404);
}
