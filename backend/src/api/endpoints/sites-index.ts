import { error, ensureDomain } from '../../shared/http.ts';
import { listSites } from './sites-list.ts';
import {
  getSiteInfo,
  downloadSite,
  getSiteIcon,
  getSiteMeta,
  getSiteStats,
  getSiteVisitors,
  getSiteUptime,
  getSiteRepos,
} from './sites-info.ts';
import { getSiteVersions } from './sites-versions-get.ts';
import { upload } from './upload-post.ts';
import { fetchGithub } from './fetch-github-post.ts';
import { deleteVersion } from './sites-versions-delete.ts';
import { activateVersion } from './sites-versions-post.ts';
import { deleteSite } from './sites-delete.ts';
import { toggleSite } from './sites-toggle-patch.ts';
import { updateMeta } from './sites-meta-patch.ts';
import type { CtxRouteHandler, RouteContext } from './sites-types.ts';

const GET_ROUTES: [string, CtxRouteHandler][] = [
  ['', getSiteInfo],
  ['download', downloadSite],
  ['icon', getSiteIcon],
  ['meta', getSiteMeta],
  ['stats', getSiteStats],
  ['visitors', getSiteVisitors],
  ['uptime', getSiteUptime],
  ['repos', getSiteRepos],
  ['versions', getSiteVersions],
];

export async function sites(req: Request, path: string): Promise<Response> {
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
    const route = GET_ROUTES.find(([routeAction]) => {
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
