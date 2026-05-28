import { error, json, CORS } from '../../shared/http.ts';
import { getStats, getVisitors, getUptime } from '../../services/analytics.ts';
import { loadSiteData } from '../../services/meta.ts';
import { resolveZipPath, getIcon } from '../../services/versions.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteInfo({ domain }: RouteContext): Promise<Response> {
  const zipPath = await resolveZipPath(domain);
  if (!zipPath) {
    return error('Site not found', 404);
  }
  const data = await loadSiteData(domain);
  return json({ domain, enabled: data.enabled });
}

export async function downloadSite({ domain }: RouteContext): Promise<Response> {
  const zipPath = await resolveZipPath(domain);
  if (!zipPath) {
    return error('Site not found', 404);
  }
  const file = await Deno.open(zipPath);
  const headers = {
    ...CORS,
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${domain}.zip"`,
  };
  return new Response(file.readable, { headers });
}

export async function getSiteIcon({ domain }: RouteContext): Promise<Response> {
  const icon = await getIcon(domain);
  if (!icon) {
    return new Response(undefined, { status: 404, headers: CORS });
  }
  const headers = { ...CORS, 'Content-Type': icon.type, 'Cache-Control': 'public, max-age=300' };
  return new Response(icon.data.buffer as ArrayBuffer, { headers });
}

export async function getSiteMeta({ domain }: RouteContext): Promise<Response> {
  const data = await loadSiteData(domain);
  return json({ domain, accent: data.accent });
}

export function getSiteStats({ domain, url }: RouteContext): Response {
  const slotsParam = url.searchParams.get('slots') ?? '60';
  const slots = parseInt(slotsParam, 10);

  let count: number;
  if (isNaN(slots)) {
    count = 60;
  } else {
    count = slots;
  }

  const stats = getStats(domain, count);
  return json({ domain, stats });
}

export function getSiteVisitors({ domain }: RouteContext): Response {
  const visitors = getVisitors(domain);
  return json({ domain, visitors });
}

export function getSiteUptime({ domain, url }: RouteContext): Response {
  const slotsParam = url.searchParams.get('slots') ?? '60';
  const slots = parseInt(slotsParam, 10);

  let count: number;
  if (isNaN(slots)) {
    count = 60;
  } else {
    count = slots;
  }

  const uptime = getUptime(domain, count);
  return json({ domain, uptime });
}

export async function getSiteRepos({ domain }: RouteContext): Promise<Response> {
  const data = await loadSiteData(domain);
  return json({ domain, history: data.repoHistory });
}
