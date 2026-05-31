import { json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';

export async function listSites(): Promise<Response> {
  const siteList = await sites.listSites();
  return json({ sites: siteList });
}
