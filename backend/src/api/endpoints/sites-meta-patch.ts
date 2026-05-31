import { error, json, parseJson } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function updateMeta({ domain }: RouteContext, req: Request): Promise<Response> {
  const body = await parseJson<{ accent?: string | undefined }>(req);
  if (body instanceof Response) return body;

  try {
    await sites.updateSiteMeta(domain, body);
    return json({ domain, accent: body.accent });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update meta';
    const status = message.includes('not found') ? 404 : 400;
    return error(message, status);
  }
}
