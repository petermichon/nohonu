import { error, json } from '../../shared/http.ts';
import { getVersionPath, fileExists } from '../../shared/paths.ts';
import { listVersions } from '../../services/versions.ts';
import { loadSiteData } from '../../services/meta.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteVersions({ domain, timestamp: index, subAction }: RouteContext): Promise<Response> {
  if (index && subAction === 'download') {
    const vPath = getVersionPath(domain, index);
    if (!(await fileExists(vPath))) {
      return error('Version not found', 404);
    }
    const file = await Deno.open(vPath);
    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${domain}-${index}.zip"`,
    };
    return new Response(file.readable, { headers });
  }
  const versions = await listVersions(domain);
  const data = await loadSiteData(domain);
  return json({ domain, versions, current: data.currentIndex });
}
