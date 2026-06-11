import { error } from '../../shared/http.ts';
import { getCustomDomainCache } from '../../usecases/sites/index.ts';

export async function checkCustomDomain(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const domain = url.searchParams.get('domain');

  if (!domain) {
    return error('domain query parameter is required', 400);
  }

  const cache = await getCustomDomainCache();
  const mappedDomain = cache.get(domain);

  if (mappedDomain) {
    return new Response('OK', { status: 200 });
  }

  return error('Domain not found', 404);
}
