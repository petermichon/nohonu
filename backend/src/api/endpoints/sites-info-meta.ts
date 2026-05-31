import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteMeta({ domain }: RouteContext): Promise<Response> {
  const meta = await sites.getSiteMeta(domain);
  if (!meta) {
    return error('Site not found', 404);
  }
  return json({ domain, accent: meta.accent });
}
