import { error, json } from '../../shared/http.ts';
import { VALID_CUSTOM_DOMAIN, MAX_CUSTOM_DOMAIN_LENGTH } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function deleteCustomDomain({ domain, customDomain }: RouteContext): Promise<Response> {
  if (!customDomain) {
    return error('customDomain is required', 400);
  }

  if (customDomain.length > MAX_CUSTOM_DOMAIN_LENGTH || !VALID_CUSTOM_DOMAIN.test(customDomain)) {
    return error('Invalid custom domain format', 400);
  }

  const result = await sites.removeCustomDomain(domain, customDomain);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, customDomain });
}
