import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, parseJson, p } from '../../shared/express/http.ts';
import { VALID_CUSTOM_DOMAIN, MAX_CUSTOM_DOMAIN_LENGTH } from '../../shared/paths.ts';
import { addCustomDomain as addCustomDomainUsecase } from '../../usecases/sites/add-custom-domain.ts';
import { getAllCustomDomains as getAllCustomDomainsUsecase } from '../../usecases/sites/get-all-custom-domains.ts';
import { getCustomDomains as getCustomDomainsUsecase } from '../../usecases/sites/get-custom-domains.ts';
import { getVerificationToken as getVerificationTokenUsecase } from '../../usecases/sites/get-verification-token.ts';
import { removeCustomDomain } from '../../usecases/sites/remove-custom-domain.ts';
import { verifyCustomDomain as verifyCustomDomainUsecase } from '../../usecases/sites/verify-custom-domain.ts';
import { sendUsecaseError } from '../../shared/express/errors.ts';

function requireCustomDomain(customDomain: string | undefined): string | undefined {
  if (!customDomain) return;
  if (customDomain.length > MAX_CUSTOM_DOMAIN_LENGTH || !VALID_CUSTOM_DOMAIN.test(customDomain)) return;
  return customDomain;
}

export async function getAllCustomDomains(req: ExpressReq, res: ExpressRes): Promise<void> {
  try {
    const account = req.get('X-Account') || undefined;
    const allCustomDomains = await getAllCustomDomainsUsecase(account);
    json(res, { customDomains: allCustomDomains });
  } catch (err) {
    json(res, { error: err instanceof Error ? err.message : 'Failed to get custom domains' }, 500);
  }
}

export async function getCustomDomains(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const result = await getCustomDomainsUsecase(sessionId, p(req, 'domain') || '');
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { customDomains: result.value });
}

export async function addCustomDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const body = await parseJson<{ customDomain: string }>(req);
  if (!body || !body.customDomain) {
    json(res, { error: 'customDomain is required' }, 400);
    return;
  }

  const customDomain = requireCustomDomain(body.customDomain);
  if (!customDomain) {
    json(res, { error: 'Invalid custom domain format' }, 400);
    return;
  }

  const result = await addCustomDomainUsecase(sessionId, p(req, 'domain') || '', customDomain);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { domain: p(req, 'domain') || '', customDomain, verified: false });
}

export async function deleteCustomDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const customDomain = requireCustomDomain(p(req, 'subAction'));
  if (!customDomain) {
    json(res, { error: 'Invalid custom domain format' }, 400);
    return;
  }

  const result = await removeCustomDomain(sessionId, p(req, 'domain') || '', customDomain);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { domain: p(req, 'domain') || '', customDomain });
}

export async function verifyCustomDomain(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  if (!sessionId) {
    json(res, { error: 'Missing username' }, 401);
    return;
  }

  const customDomain = requireCustomDomain(p(req, 'subAction'));
  if (!customDomain) {
    json(res, { error: 'Invalid custom domain format' }, 400);
    return;
  }

  const result = await verifyCustomDomainUsecase(sessionId, p(req, 'domain') || '', customDomain);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { domain: p(req, 'domain') || '', customDomain, verified: result.value.verified });
}

export async function getVerificationToken(req: ExpressReq, res: ExpressRes): Promise<void> {
  const domain = p(req, 'domain') || '';
  try {
    const result = await getVerificationTokenUsecase(domain);
    json(res, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get verification token';
    json(res, { error: message }, message.includes('not found') ? 404 : 400);
  }
}
