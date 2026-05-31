import { error, CORS } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function downloadSite({ domain }: RouteContext): Promise<Response> {
  const result = await sites.downloadActiveVersion(domain);
  if (!result) {
    return error('Site not found', 404);
  }
  const headers = {
    ...CORS,
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${result.filename}"`,
  };
  return new Response(result.file.readable, { headers });
}
