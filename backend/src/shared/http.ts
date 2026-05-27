import { VALID_DOMAIN } from './paths.ts';

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
};

export const API_KEY = Deno.env.get('API_KEY');

export function requireAuth(req: Request): Response | undefined {
  if (!API_KEY) {
    return undefined;
  }
  if (req.headers.get('X-Api-Key') === API_KEY) {
    return undefined;
  }
  return error('Unauthorized', 401);
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: CORS });
}

export function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

export function validateDomain(domain: unknown): domain is string {
  return typeof domain === 'string' && VALID_DOMAIN.test(domain);
}

/** Check request method and return 405 if mismatch */
export function checkMethod(req: Request, allowed: string): Response | undefined {
  if (req.method === allowed) {
    return undefined;
  }
  return error('Method not allowed', 405);
}

/** Validate domain and return error response if invalid */
export function ensureDomain(domain: unknown): Response | string {
  if (validateDomain(domain)) {
    return domain;
  }
  return error('Invalid domain');
}

/** Parse JSON body with error handling */
export async function parseJson<T>(req: Request): Promise<Response | T> {
  try {
    return (await req.json()) as T;
  } catch {
    return error('Invalid JSON');
  }
}
