import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { VALID_DOMAIN } from './paths.ts';

export function json(res: ExpressRes, data: unknown, status = 200): void {
  res.status(status).json(data);
}

export function error(res: ExpressRes, message: string, status = 400): void {
  res.status(status).json({ error: message });
}

export function p(req: ExpressReq, name: string): string {
  return (req.params as Record<string, string>)[name] || '';
}

export function validateDomain(domain: unknown): domain is string {
  return typeof domain === 'string' && VALID_DOMAIN.test(domain);
}

function headerValue(val: string | string[] | undefined): string | undefined {
  if (!val) return undefined;
  return Array.isArray(val) ? val[0] : val;
}

export function extractClientIp(req: ExpressReq, remoteAddr: { hostname?: string } | null): string {
  const forwarded = headerValue(req.headers['x-forwarded-for']);
  const realIp = headerValue(req.headers['x-real-ip']);
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  if (realIp) return realIp;
  if (remoteAddr?.hostname) return remoteAddr.hostname;
  return 'unknown';
}

export function checkMethod(req: ExpressReq, allowed: string): boolean {
  return req.method === allowed;
}

export function ensureDomain(domain: unknown): string | null {
  return validateDomain(domain) ? domain : null;
}

export function assert(condition: boolean, message: string): void {
  if (!condition) console.error(`Assertion failed: ${message}`);
}

export function requireHeader(req: ExpressReq, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function requireUsername(req: ExpressReq): string | undefined {
  return requireHeader(req, 'X-Username');
}

export function requireSessionId(req: ExpressReq): string | undefined {
  return requireHeader(req, 'X-Session-Id');
}

export async function parseJson<T>(req: ExpressReq): Promise<T | undefined> {
  try { return JSON.parse(req.body?.toString() || '{}') as T; }
  catch { return undefined; }
}
