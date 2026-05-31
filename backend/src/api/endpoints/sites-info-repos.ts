import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteRepos({ domain }: RouteContext): Promise<Response> {
  const result = await sites.getSiteRepos(domain);
  if (!result) {
    return error('Site not found', 404);
  }
  return json({ domain, history: result.history });
}
