import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function activateVersion({ domain, timestamp: index }: RouteContext): Promise<Response> {
  if (!index || isNaN(index)) return error('Invalid index');
  try {
    await sites.activateVersion(domain, index);
    return json({ domain, index });
  } catch {
    return error('Version not found', 404);
  }
}
