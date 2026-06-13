import { error, json, parseJson } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function updateMeta({ domain }: RouteContext, req: Request): Promise<Response> {
  const body = await parseJson<{ accent?: string | undefined }>(req);
  if (body instanceof Response) return body;

  const result = await sites.updateSiteMeta(domain, body);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, accent: body.accent });
}
