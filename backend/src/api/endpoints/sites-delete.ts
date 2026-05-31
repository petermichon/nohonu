import { json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function deleteSite({ domain }: RouteContext): Promise<Response> {
  await sites.deleteSite(domain);
  return json({ domain });
}
