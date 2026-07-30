import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, parseJson, p, requireUsername } from '../../shared/http.ts';
import { VALID_CUSTOM_DOMAIN, MAX_CUSTOM_DOMAIN_LENGTH } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';

function requireCustomDomain(customDomain: string | undefined): string | undefined {
  if (!customDomain) return;
  if (customDomain.length > MAX_CUSTOM_DOMAIN_LENGTH || !VALID_CUSTOM_DOMAIN.test(customDomain)) return;
  return customDomain;
}

export async function getAllCustomDomains(req: ExpressReq, res: ExpressRes): Promise<void> {
  try {
    const account = req.get('X-Account') || undefined;
    const allCustomDomains = await sites.getAllCustomDomains(account);
    json(res, { customDomains: allCustomDomains });
  } catch (err) {
    json(res, { error: err instanceof Error ? err.message : 'Failed to get custom domains' }, 500);
  }
}

export async function getCustomDomains(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = requireUsername(req);
  if (!username) { json(res, { error: 'Missing username' }, 401); return; }

  try {
    const result = await sites.getCustomDomains(username, p(req, 'domain') || '');
    json(res, { customDomains: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get custom domains';
    json(res, { error: message }, message.includes('not found') ? 404 : 400);
  }
}

export async function addCustomDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = requireUsername(req);
  if (!username) { json(res, { error: 'Missing username' }, 401); return; }

  const body = await parseJson<{ customDomain: string }>(req);
  if (!body || !body.customDomain) { json(res, { error: 'customDomain is required' }, 400); return; }

  const customDomain = requireCustomDomain(body.customDomain);
  if (!customDomain) { json(res, { error: 'Invalid custom domain format' }, 400); return; }

  const result = await sites.addCustomDomain(username, p(req, 'domain') || '', customDomain);
  if (!result.ok) { json(res, { error: result.error }, result.status); return; }
  json(res, { domain: p(req, 'domain') || '', customDomain, verified: false });
}

export async function deleteCustomDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = requireUsername(req);
  if (!username) { json(res, { error: 'Missing username' }, 401); return; }

  const customDomain = requireCustomDomain(p(req, 'subAction'));
  if (!customDomain) { json(res, { error: 'Invalid custom domain format' }, 400); return; }

  const result = await sites.removeCustomDomain(username, p(req, 'domain') || '', customDomain);
  if (!result.ok) { json(res, { error: result.error }, result.status); return; }
  json(res, { domain: p(req, 'domain') || '', customDomain });
}

export async function verifyCustomDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const username = requireUsername(req);
  if (!username) { json(res, { error: 'Missing username' }, 401); return; }

  const customDomain = requireCustomDomain(p(req, 'subAction'));
  if (!customDomain) { json(res, { error: 'Invalid custom domain format' }, 400); return; }

  const result = await sites.verifyCustomDomain(username, p(req, 'domain') || '', customDomain);
  if (!result.ok) { json(res, { error: result.error }, result.status); return; }
  json(res, { domain: p(req, 'domain') || '', customDomain, verified: result.value.verified });
}

export async function getVerificationToken(req: ExpressReq, res: ExpressRes): Promise<void> {
  const domain = p(req, 'domain') || '';
  const user = await sites.findUserForDomain(domain);
  if (!user) { json(res, { error: 'Site not found' }, 404); return; }

  try {
    const result = await sites.getVerificationToken(domain);
    json(res, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get verification token';
    json(res, { error: message }, message.includes('not found') ? 404 : 400);
  }
}
