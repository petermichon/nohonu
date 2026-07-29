import { error, checkMethod } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import { getCustomDomainCache } from '../../usecases/sites/index.ts';

export async function checkDomain(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return new Response(undefined, { status: 405 });

  const url = new URL(req.url);
  const rawDomain = url.searchParams.get('domain') ?? '';
  const user = url.searchParams.get('user') ?? '';

  const exists = await sites.checkDomain(user, rawDomain);
  return new Response(undefined, { status: exists ? 200 : 404 });
}

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

export async function checkSubdomain(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const subdomain = url.searchParams.get('subdomain');

  if (!subdomain) {
    return error('subdomain query parameter is required', 400);
  }

  const exists = await sites.checkSubdomain(subdomain);
  return new Response(undefined, { status: exists ? 200 : 404 });
}
