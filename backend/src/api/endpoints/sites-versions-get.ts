import { error, json } from '../../shared/http.ts';
import { SITES_DIR, fileExists } from '../../shared/paths.ts';
import { listVersions, getCurrentVersionTimestamp } from '../../services/versions.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteVersions({ domain, timestamp, subAction }: RouteContext): Promise<Response> {
  if (timestamp && subAction === 'download') {
    const vPath = `${SITES_DIR}/${domain}@${timestamp}.zip`;
    if (!(await fileExists(vPath))) {
      return error('Version not found', 404);
    }
    const file = await Deno.open(vPath);
    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${domain}-${timestamp}.zip"`,
    };
    return new Response(file.readable, { headers });
  }
  const versions = await listVersions(domain);
  const current = await getCurrentVersionTimestamp(domain);
  return json({ domain, versions, current });
}
