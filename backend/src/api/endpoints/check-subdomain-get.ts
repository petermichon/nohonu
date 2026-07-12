import { error } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';

export async function checkSubdomain(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const subdomain = url.searchParams.get('subdomain');

  if (!subdomain) {
    return error('subdomain query parameter is required', 400);
  }

  const exists = await sites.checkSubdomain(subdomain);
  return new Response(undefined, { status: exists ? 200 : 404 });
}
