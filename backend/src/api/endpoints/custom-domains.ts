import { error, json, parseJson } from '../../shared/http.ts';
import { VALID_CUSTOM_DOMAIN, MAX_CUSTOM_DOMAIN_LENGTH } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';
import * as storage from '../../core/sites/storage.ts';
import type { RouteContext } from './sites-types.ts';

export async function getAllCustomDomains(req: Request): Promise<Response> {
  try {
    const account = req.headers.get('X-Account');
    const allCustomDomains = await sites.getAllCustomDomains();

    let filteredDomains = allCustomDomains;
    if (account) {
      filteredDomains = [];
      for (const cd of allCustomDomains) {
        const siteData = await storage.readSiteMetadata(cd.user, cd.siteDomain);
        if (siteData?.account === account) {
          filteredDomains.push(cd);
        }
      }
    }

    return json({ customDomains: filteredDomains });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get custom domains';
    return error(message, 500);
  }
}

export async function getCustomDomains(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  try {
    const customDomains = await sites.getCustomDomains(username, domain);
    return json({ customDomains });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get custom domains';
    const status = message.includes('not found') ? 404 : 400;
    return error(message, status);
  }
}

export async function addCustomDomain(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const body = await parseJson<{ customDomain: string }>(req);
  if (body instanceof Response) {
    return body;
  }

  if (!body.customDomain || typeof body.customDomain !== 'string') {
    return error('customDomain is required', 400);
  }

  if (body.customDomain.length > MAX_CUSTOM_DOMAIN_LENGTH || !VALID_CUSTOM_DOMAIN.test(body.customDomain)) {
    return error('Invalid custom domain format. Use a valid lowercase hostname (e.g. blog.example.com)', 400);
  }

  const result = await sites.addCustomDomain(username, domain, body.customDomain);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, customDomain: body.customDomain, verified: false });
}

export async function deleteCustomDomain(req: Request, { domain, customDomain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  if (!customDomain) {
    return error('customDomain is required', 400);
  }

  if (customDomain.length > MAX_CUSTOM_DOMAIN_LENGTH || !VALID_CUSTOM_DOMAIN.test(customDomain)) {
    return error('Invalid custom domain format', 400);
  }

  const result = await sites.removeCustomDomain(username, domain, customDomain);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, customDomain });
}

export async function verifyCustomDomain(req: Request, { domain, customDomain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  if (!customDomain) {
    return error('customDomain is required', 400);
  }

  if (customDomain.length > MAX_CUSTOM_DOMAIN_LENGTH || !VALID_CUSTOM_DOMAIN.test(customDomain)) {
    return error('Invalid custom domain format', 400);
  }

  const result = await sites.verifyCustomDomain(username, domain, customDomain);
  if (!result.ok) {
    return error(result.error, result.status);
  }
  return json({ domain, customDomain, verified: result.value.verified });
}

export async function getVerificationToken(_req: Request, { domain }: RouteContext): Promise<Response> {
  const user = await sites.findUserForDomain(domain);
  if (!user) {
    return error('Site not found', 404);
  }
  try {
    const result = await sites.getVerificationToken(domain);
    return json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get verification token';
    const status = message.includes('not found') ? 404 : 400;
    return error(message, status);
  }
}
