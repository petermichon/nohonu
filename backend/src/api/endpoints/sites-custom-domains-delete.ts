import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function deleteCustomDomain({ domain, customDomain }: RouteContext): Promise<Response> {
  if (!customDomain) {
    return error('customDomain is required', 400);
  }

  try {
    await sites.removeCustomDomain(domain, customDomain);
    return json({ domain, customDomain });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete custom domain';
    const status = message.includes('not found') ? 404 : 400;
    return error(message, status);
  }
}
