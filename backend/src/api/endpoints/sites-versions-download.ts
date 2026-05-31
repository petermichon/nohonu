import { error } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function downloadSiteVersion({ domain, timestamp: index }: RouteContext): Promise<Response> {
  if (!index) {
    return error('Version timestamp required', 400);
  }
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
