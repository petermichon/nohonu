import { error, json, parseJson } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function addCustomDomain({ domain }: RouteContext, req: Request): Promise<Response> {
  const body = await parseJson<{ customDomain: string }>(req);
  if (body instanceof Response) return body;

  if (!body.customDomain || typeof body.customDomain !== 'string') {
    return error('customDomain is required', 400);
  }

  try {
    await sites.addCustomDomain(domain, body.customDomain);
    return json({ domain, customDomain: body.customDomain, verified: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add custom domain';
    const status = message.includes('not found') ? 404 : 400;
    return error(message, status);
  }
}
