import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function getVerificationToken(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) {
    return error('Site not found', 404);
  }
  try {
    const result = await sites.getVerificationToken(domain);
    return json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get verification token';
    const status = message.includes('not found') ? 404 : 400;
    return error(message, status);
  }
}
