import { json } from '../../shared/http.ts';
import { SITES_DIR } from '../../shared/paths.ts';
import { getTotalHits, getUptimePct } from '../../services/analytics.ts';
import { loadSiteData } from '../../services/meta.ts';

type SiteEntry = { domain: string; enabled: boolean; hits: number; uptime: number | undefined; accent?: string };

async function buildEntry(domain: string): Promise<SiteEntry> {
  const data = await loadSiteData(domain);
  return {
    domain,
    enabled: data.enabled,
    hits: getTotalHits(domain),
    uptime: getUptimePct(domain),
    accent: data.accent,
  };
}

export async function listSites(): Promise<Response> {
  const domains: string[] = [];
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.name.endsWith('.json') && !entry.name.includes('@')) {
        domains.push(entry.name.slice(0, -'.json'.length));
      }
    }
  } catch {
    return json({ sites: [] });
  }
  const sitePromises = domains.map(buildEntry);
  const sites = await Promise.all(sitePromises);
  return json({ sites });
}
