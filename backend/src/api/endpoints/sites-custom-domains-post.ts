import { error, json, parseJson } from '../../shared/http.ts';
import { VALID_CUSTOM_DOMAIN, MAX_CUSTOM_DOMAIN_LENGTH } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function addCustomDomain(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const body = await parseJson<{ customDomain: string }>(req);
  if (body instanceof Response) {
    return body;
  }

  if (!body.customDomain || typeof body.customDomain !== 'string') {
    return error('customDomain is required', 400);
  }

  if (body.customDomain.length > MAX_CUSTOM_DOMAIN_LENGTH || !VALID_CUSTOM_DOMAIN.test(body.customDomain)) {
    return error('Invalid custom domain format. Use a valid lowercase hostname (e.g. blog.example.com)', 400);
  }

  const result = await sites.addCustomDomain(username, domain, body.customDomain);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, customDomain: body.customDomain, verified: false });
}
