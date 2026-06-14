import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';

export async function getAllCustomDomains(): Promise<Response> {
  try {
    const customDomains = await sites.getAllCustomDomains();
    return json({ customDomains });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get custom domains';
    return error(message, 500);
  }
}
