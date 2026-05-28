import { error, json, parseJson } from '../../shared/http.ts';
import { readSiteMetadata, writeSiteMetadata, VALID_ACCENT } from '../../services/sites-folder.ts';
import type { RouteContext } from './sites-types.ts';

export async function updateMeta({ domain }: RouteContext, req: Request): Promise<Response> {
  const body = await parseJson<{ accent?: string | undefined }>(req);
  if (body instanceof Response) {
    return body;
  }

  const data = await readSiteMetadata(domain);
  if (!data) {
    return error('Site not found', 404);
  }
  if ('accent' in body) {
    if (body.accent !== undefined && !VALID_ACCENT.test(body.accent)) {
      return error('Invalid accent color');
    }
    data.accent = body.accent;
  }
  await writeSiteMetadata(domain, data);
  return json({ success: true, domain, accent: data.accent });
}
