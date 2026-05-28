import { error, json } from '../../shared/http.ts';
import { getVersionPath, fileExists } from '../../shared/paths.ts';
import { loadSiteData, saveSiteData } from '../../services/meta.ts';
import type { RouteContext } from './sites-types.ts';

export async function deleteVersion({ domain, timestamp: index }: RouteContext): Promise<Response> {
  if (!index || isNaN(index)) {
    return error('Invalid index');
  }
  const vPath = getVersionPath(domain, index);
  if (!(await fileExists(vPath))) {
    return error('Version not found', 404);
  }
  await Deno.remove(vPath);
  const data = await loadSiteData(domain);
  delete data.versions[String(index)];
  await saveSiteData(domain, data);
  return json({ success: true, domain, index });
}
