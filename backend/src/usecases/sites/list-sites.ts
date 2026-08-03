import { listSites as listSitesQuery } from '../../core/sites/list-sites.ts';


export async function listSites(user: string): Promise<Awaited<ReturnType<typeof listSitesQuery>>> {
  return await listSitesQuery(user);
}
