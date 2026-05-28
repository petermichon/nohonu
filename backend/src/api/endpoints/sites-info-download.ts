import { error, CORS } from '../../shared/http.ts';
import { readSiteMetadata, openActiveVersion } from '../../services/sites-folder.ts';
import type { RouteContext } from './sites-types.ts';

export async function downloadSite({ domain }: RouteContext): Promise<Response> {
  const data = await readSiteMetadata(domain);
  if (!data || !data.enabled || data.currentIndex === null) {
    return error('Site not found', 404);
  }
  const file = await openActiveVersion(domain);
  if (!file) {
    return error('Site not found', 404);
  }
  const headers = {
    ...CORS,
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${domain}.zip"`,
  };
  return new Response(file.readable, { headers });
}
