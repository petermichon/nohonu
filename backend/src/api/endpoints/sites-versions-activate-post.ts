import { error, json } from '../../shared/http.ts';
import { activateVersion as activateSiteVersion, versionExists } from '../../services/sites-folder.ts';
import type { RouteContext } from './sites-types.ts';

export async function activateVersion({ domain, timestamp: index }: RouteContext): Promise<Response> {
  if (!index || isNaN(index)) {
    return error('Invalid index');
  }
  if (!(await versionExists(domain, index))) {
    return error('Version not found', 404);
  }
  await activateSiteVersion(domain, index);
  return json({ success: true, domain, index });
}
