import { error, json, parseJson } from '../../shared/http.ts';
import { loadMeta, saveMeta, VALID_ACCENT } from '../../services/meta.ts';
import type { RouteContext } from './sites-types.ts';

export async function updateMeta({ domain }: RouteContext, req: Request): Promise<Response> {
  const body = await parseJson<{ accent?: string | undefined }>(req);
  if (body instanceof Response) {
    return body;
  }

  const current = await loadMeta(domain);
  if ('accent' in body) {
    if (body.accent !== undefined && !VALID_ACCENT.test(body.accent)) {
      return error('Invalid accent color');
    }
    if (body.accent !== undefined) {
      current.accent = body.accent;
    } else {
      current.accent = undefined;
    }
  }
  await saveMeta(domain, current);
  return json({ success: true, domain, ...current });
}
