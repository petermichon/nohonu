import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import * as storage from '../../core/sites/storage.ts';

export async function getUserSites(_req: Request, username: string): Promise<Response> {
  const users = await storage.listUsers();
  if (!users.includes(username)) {
    return error('User not found', 404);
  }

  const siteList = await sites.listSites(username);
  return json({ sites: siteList });
}
