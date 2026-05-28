import { json } from '../../shared/http.ts';
import { deleteAllSiteFiles } from '../../services/sites-folder.ts';
import { hits, visitors, uptime } from '../../services/analytics.ts';
import type { RouteContext } from './sites-types.ts';

export async function deleteSite({ domain }: RouteContext): Promise<Response> {
  await deleteAllSiteFiles(domain);

  hits.delete(domain);
  visitors.delete(domain);
  uptime.delete(domain);
  return json({ success: true, domain });
}
