import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';

export async function listSites(req: Request): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const siteList = await sites.listSites(username);
  return json({ sites: siteList });
}
