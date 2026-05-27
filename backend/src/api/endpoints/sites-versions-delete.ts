import { error, json } from '../../shared/http.ts';
import { SITES_DIR, fileExists } from '../../shared/paths.ts';
import type { RouteContext } from './sites-types.ts';

export async function deleteVersion({ domain, timestamp }: RouteContext): Promise<Response> {
  if (!timestamp || isNaN(timestamp)) {
    return error('Invalid timestamp');
  }
  const vPath = `${SITES_DIR}/${domain}@${timestamp}.zip`;
  if (!(await fileExists(vPath))) {
    return error('Version not found', 404);
  }
  await Deno.remove(vPath);
  return json({ success: true, domain, timestamp });
}
