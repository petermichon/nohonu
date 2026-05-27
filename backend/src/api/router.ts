import { CORS, requireAuth } from '../shared/http.ts';
import { health } from './endpoints/health-get.ts';
import { auth } from './endpoints/auth-get.ts';
import { checkDomain } from './endpoints/check-domain-get.ts';
import { sites } from './endpoints/sites-index.ts';
import { serveStatic } from './endpoints/get.ts';

type Endpoint = {
  handler: (req: Request, path: string, info: Deno.ServeHandlerInfo) => Promise<Response> | Response;
  auth?: boolean;
};

const routes: Record<string, Endpoint> = {
  '/health': { handler: health },
  '/auth': { handler: auth },
  '/check-domain': { handler: checkDomain },
};

function matchRoute(path: string): Endpoint | undefined {
  if (routes[path]) {
    return routes[path];
  }
  if (path === '/sites' || path.startsWith('/sites/')) {
    return { handler: sites, auth: true };
  }
  return undefined;
}

export async function handler(req: Request, info: Deno.ServeHandlerInfo): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  if (req.method === 'OPTIONS') {
    return new Response(undefined, { headers: CORS });
  }

  const route = matchRoute(path);

  // Static file serving as fallback
  if (!route) {
    try {
      return await serveStatic(req, path, info);
    } catch (err) {
      console.error('Error in static endpoint:', err);
      return new Response('Internal server error', { status: 500, headers: CORS });
    }
  }

  if (route.auth) {
    const authError = requireAuth(req);
    if (authError) {
      return authError;
    }
  }

  let response: Response;
  try {
    response = await route.handler(req, path, info);
  } catch (err) {
    console.error('Error in endpoint:', err);
    return new Response('Internal server error', { status: 500, headers: CORS });
  }

  let headers: Headers;
  try {
    headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(CORS)) {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    }
  } catch {
    headers = new Headers(CORS);
  }

  const finalResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
  return finalResponse;
}
