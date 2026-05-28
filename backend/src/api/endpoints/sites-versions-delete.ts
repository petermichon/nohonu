import { error, json } from '../../shared/http.ts';
import { deleteVersion as deleteSiteVersion, versionExists } from '../../services/sites-folder.ts';
import type { RouteContext } from './sites-types.ts';

export async function deleteVersion({ domain, timestamp: index }: RouteContext): Promise<Response> {
  if (!index || isNaN(index)) {
    return error('Invalid index');
  }
  if (!(await versionExists(domain, index))) {
    return error('Version not found', 404);
  }
  await deleteSiteVersion(domain, index);
  return json({ success: true, domain, index });
}
