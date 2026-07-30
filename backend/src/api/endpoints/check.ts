import { error, checkMethod } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import { getCustomDomainCache } from '../../usecases/sites/index.ts';

// === Params

function extractDomainParams(req: Request): { domain: string; user: string } | Response {
  const url = new URL(req.url);
  const domain = url.searchParams.get('domain') ?? '';
  const user = url.searchParams.get('user') ?? '';
  return { domain, user };
}

function extractCustomDomainParam(req: Request): string | Response {
  const url = new URL(req.url);
  const domain = url.searchParams.get('domain');
  if (!domain) return error('domain query parameter is required', 400);
  return domain;
}

function extractSubdomainParam(req: Request): string | Response {
  const url = new URL(req.url);
  const subdomain = url.searchParams.get('subdomain');
  if (!subdomain) return error('subdomain query parameter is required', 400);
  return subdomain;
}

// === Handlers

export async function checkDomain(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return new Response(undefined, { status: 405 });

  const params = extractDomainParams(req);
  if (params instanceof Response) return params;
  const exists = await sites.checkDomain(params.user, params.domain);
  return new Response(undefined, { status: exists ? 200 : 404 });
}

export async function checkCustomDomain(req: Request): Promise<Response> {
  const params = extractCustomDomainParam(req);
  if (params instanceof Response) return params;

  const cache = await getCustomDomainCache();
  if (cache.get(params)) return new Response('OK', { status: 200 });
  return error('Domain not found', 404);
}

export async function checkSubdomain(req: Request): Promise<Response> {
  const subdomain = extractSubdomainParam(req);
  if (subdomain instanceof Response) return subdomain;

  const exists = await sites.checkSubdomain(subdomain);
  return new Response(undefined, { status: exists ? 200 : 404 });
}
