import { error, json } from '../../shared/http.ts';
import { readSiteMetadata } from '../../services/sites-folder.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteMeta({ domain }: RouteContext): Promise<Response> {
  const data = await readSiteMetadata(domain);
  if (!data) {
    return error('Site not found', 404);
  }
  return json({ domain, accent: data.accent });
}
