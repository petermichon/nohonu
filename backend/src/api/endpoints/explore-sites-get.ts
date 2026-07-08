import { json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';

export async function listExploreSites(req: Request): Promise<Response> {
  const username = req.headers.get('X-Username') || undefined;
  const allSites = await sites.listAllSites(username);
  return json({ sites: allSites });
}
