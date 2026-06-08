import { CORS, requireAuth, error, ensureDomain, delay } from '../shared/http.ts';
import { health } from './endpoints/health-get.ts';
import { auth } from './endpoints/auth-get.ts';
import { checkDomain } from './endpoints/check-domain-get.ts';
import { serveStatic } from './endpoints/get.ts';
import { listSites } from './endpoints/sites-list-get.ts';
import { getSiteInfo } from './endpoints/sites-info-get.ts';
import { downloadSite } from './endpoints/sites-info-download.ts';
import { getSiteIcon } from './endpoints/sites-info-icon.ts';
import { getSiteMeta } from './endpoints/sites-info-meta.ts';
import { getSiteStats } from './endpoints/sites-info-stats.ts';
import { getSiteVisitors } from './endpoints/sites-info-visitors.ts';
import { getSiteUptime } from './endpoints/sites-info-uptime.ts';
import { getSiteRepos } from './endpoints/sites-info-repos.ts';
import { listSiteVersions } from './endpoints/sites-versions-list-get.ts';
import { downloadSiteVersion } from './endpoints/sites-versions-download.ts';
import { upload } from './endpoints/sites-versions-upload-post.ts';
import { fetchGithub } from './endpoints/sites-versions-github-post.ts';
import { deleteVersion } from './endpoints/sites-versions-delete.ts';
import { activateVersion } from './endpoints/sites-versions-activate-post.ts';
import { deleteSite } from './endpoints/sites-delete.ts';
import { toggleSite } from './endpoints/sites-toggle-patch.ts';
import { updateMeta } from './endpoints/sites-meta-patch.ts';
import type { CtxRouteHandler, RouteContext } from './endpoints/sites-types.ts';

type Endpoint = {
  handler: (req: Request, path: string, info: Deno.ServeHandlerInfo) => Promise<Response> | Response;
  auth?: boolean;
};

const routes: Record<string, Endpoint> = {
  '/health': { handler: health },
  '/auth': { handler: auth },
  '/check-domain': { handler: checkDomain },
};

const SITE_GET_ROUTES: [string, CtxRouteHandler][] = [
  ['', getSiteInfo],
  ['download', downloadSite],
  ['icon', getSiteIcon],
  ['meta', getSiteMeta],
  ['stats', getSiteStats],
  ['visitors', getSiteVisitors],
  ['uptime', getSiteUptime],
  ['repos', getSiteRepos],
  ['versions', listSiteVersions],
  ['versions/download', downloadSiteVersion],
];

async function handleSiteRoute(req: Request, path: string): Promise<Response> {
  const url = new URL(req.url);

  if (path === '/sites' && req.method === 'GET') {
    return await listSites();
  }

  if (!path.startsWith('/sites/')) {
    return error('Endpoint not found', 404);
  }

  const parts = path.split('/').filter(Boolean);
  const domain = parts[1];
  const action = parts[2];
  const subAction = parts[4];
  const timestamp = parseInt(parts[3], 10);

  const domainCheck = ensureDomain(domain);
  if (domainCheck instanceof Response) {
    return domainCheck;
  }

  let parsedTimestamp: number | undefined;
  if (isNaN(timestamp)) {
    parsedTimestamp = undefined;
  } else {
    parsedTimestamp = timestamp;
  }
  const ctx: RouteContext = { domain, action, subAction, timestamp: parsedTimestamp, url };

  if (req.method === 'GET') {
    const compareAction = action ?? '';
    const route = SITE_GET_ROUTES.find(([routeAction]) => {
      return routeAction === compareAction;
    });

    if (route) {
      return route[1](ctx);
    }
  }

  if (req.method === 'DELETE') {
    if (action === 'versions') {
      return deleteVersion(ctx);
    }
    if (!action) {
      return deleteSite(ctx);
    }
  }

  if (req.method === 'POST' && action === 'versions') {
    if (subAction === 'activate') {
      return activateVersion(ctx);
    }
    if (subAction === 'github') {
      return fetchGithub(req, ctx);
    }
    if (!subAction) {
      return upload(req, ctx);
    }
  }

  if (req.method === 'PATCH') {
    if (action === 'toggle') {
      return toggleSite(ctx);
    }
    if (action === 'meta') {
      return updateMeta(ctx, req);
    }
  }

  return error('Endpoint not found', 404);
}

function matchRoute(path: string): Endpoint | undefined {
  if (routes[path]) {
    return routes[path];
  }
  if (path === '/sites' || path.startsWith('/sites/')) {
    return { handler: handleSiteRoute, auth: true };
  }
  return undefined;
}

export async function handler(req: Request, info: Deno.ServeHandlerInfo): Promise<Response> {
  // await delay(1000);
  const start = Date.now();
  const url = new URL(req.url);
  const path = url.pathname;

  if (req.method === 'OPTIONS') {
    return new Response(undefined, { headers: CORS });
  }

  const route = matchRoute(path);

  // Static file serving as fallback
  if (!route) {
    let response: Response;
    try {
      response = await serveStatic(req, path, info);
    } catch (err) {
      console.error('Error in static endpoint:', err);
      response = new Response('Internal server error', { status: 500, headers: CORS });
    }
    console.log(`${req.method} ${path} ${response.status} ${Date.now() - start}ms`);
    return response;
  }

  if (route.auth) {
    const authError = requireAuth(req);
    if (authError) {
      console.log(`${req.method} ${path} ${authError.status} ${Date.now() - start}ms`);
      return authError;
    }
  }

  let response: Response;
  try {
    response = await route.handler(req, path, info);
  } catch (err) {
    console.error('Error in endpoint:', err);
    response = new Response('Internal server error', { status: 500, headers: CORS });
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
  console.log(`${req.method} ${path} ${finalResponse.status} ${Date.now() - start}ms`);
  return finalResponse;
}
