import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteVersions(
  req: Request,
  { domain, timestamp: index, subAction }: RouteContext,
): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  if (index && subAction === 'download') {
    const result = await sites.downloadVersion(username, domain, index);
    if (!result) {
      return error('Version not found', 404);
    }
    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    };
    return new Response(result.data as BodyInit, { headers });
  }

  const result = await sites.listVersions(username, domain);
  if (!result) {
    return json({ domain, versions: [], current: null });
  }
  return json({ domain, versions: result.versions, current: result.current });
}
