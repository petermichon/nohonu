import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function getCustomDomains({ domain }: RouteContext): Promise<Response> {
  try {
    const customDomains = await sites.getCustomDomains(domain);
    return json({ customDomains });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get custom domains';
    const status = message.includes('not found') ? 404 : 400;
    return error(message, status);
  }
}
