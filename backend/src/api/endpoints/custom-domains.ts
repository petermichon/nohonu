import { error, json, parseJson, requireUsername } from '../../shared/http.ts';
import { VALID_CUSTOM_DOMAIN, MAX_CUSTOM_DOMAIN_LENGTH } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from '../route-context.ts';

// === Params

function requireCustomDomain(customDomain: string | undefined): string | Response {
  if (!customDomain) return error('customDomain is required', 400);
  if (customDomain.length > MAX_CUSTOM_DOMAIN_LENGTH || !VALID_CUSTOM_DOMAIN.test(customDomain)) {
    return error('Invalid custom domain format. Use a valid lowercase hostname (e.g. blog.example.com)', 400);
  }
  return customDomain;
}

type AddDomainParams = { username: string; domain: string; customDomain: string };
async function extractAddDomainParams(req: Request, { domain }: RouteContext): Promise<AddDomainParams | Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const body = await parseJson<{ customDomain: string }>(req);
  if (body instanceof Response) return body;

  const customDomain = requireCustomDomain(body.customDomain);
  if (customDomain instanceof Response) return customDomain;

  return { username, domain, customDomain };
}

type DomainOpParams = { username: string; domain: string; customDomain: string };
function extractDomainOpParams(req: Request, { domain, customDomain }: RouteContext): DomainOpParams | Response {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  const validDomain = requireCustomDomain(customDomain);
  if (validDomain instanceof Response) return validDomain;

  return { username, domain, customDomain: validDomain };
}

// === Handlers

export async function getAllCustomDomains(req: Request): Promise<Response> {
  try {
    const account = req.headers.get('X-Account') || undefined;
    const allCustomDomains = await sites.getAllCustomDomains(account);
    return json({ customDomains: allCustomDomains });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get custom domains';
    return error(message, 500);
  }
}

export async function getCustomDomains(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;

  try {
    const customDomains = await sites.getCustomDomains(username, domain);
    return json({ customDomains });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get custom domains';
    return error(message, message.includes('not found') ? 404 : 400);
  }
}

export async function addCustomDomain(req: Request, ctx: RouteContext): Promise<Response> {
  const params = await extractAddDomainParams(req, ctx);
  if (params instanceof Response) return params;

  const result = await sites.addCustomDomain(params.username, params.domain, params.customDomain);
  if (!result.ok) return error(result.error, result.status);
  return json({ domain: params.domain, customDomain: params.customDomain, verified: false });
}

export async function deleteCustomDomain(req: Request, ctx: RouteContext): Promise<Response> {
  const params = extractDomainOpParams(req, ctx);
  if (params instanceof Response) return params;

  const result = await sites.removeCustomDomain(params.username, params.domain, params.customDomain);
  if (!result.ok) return error(result.error, result.status);
  return json({ domain: params.domain, customDomain: params.customDomain });
}

export async function verifyCustomDomain(req: Request, ctx: RouteContext): Promise<Response> {
  const params = extractDomainOpParams(req, ctx);
  if (params instanceof Response) return params;

  const result = await sites.verifyCustomDomain(params.username, params.domain, params.customDomain);
  if (!result.ok) return error(result.error, result.status);
  return json({ domain: params.domain, customDomain: params.customDomain, verified: result.value.verified });
}

export async function getVerificationToken(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) return error('Site not found', 404);

  try {
    const result = await sites.getVerificationToken(domain);
    return json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get verification token';
    return error(message, message.includes('not found') ? 404 : 400);
  }
}
