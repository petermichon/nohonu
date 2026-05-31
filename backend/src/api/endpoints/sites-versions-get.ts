import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteVersions({ domain, timestamp: index, subAction }: RouteContext): Promise<Response> {
  if (index && subAction === 'download') {
    const result = await sites.downloadVersion(domain, index);
    if (!result) {
      return error('Version not found', 404);
    }
    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    };
    return new Response(result.file.readable, { headers });
  }

  const result = await sites.listVersions(domain);
  if (!result) {
    return json({ domain, versions: [], current: null });
  }
  return json({ domain, versions: result.versions, current: result.current });
}
