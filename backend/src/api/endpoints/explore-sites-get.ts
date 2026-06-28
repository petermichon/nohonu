import { json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';

export async function listExploreSites(_req: Request): Promise<Response> {
  const allSites = await sites.listAllSites();
  return json({ sites: allSites });
}
