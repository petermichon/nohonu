import { json } from '../../shared/http.ts';
import { listDomains } from '../../services/sites-folder.ts';
import { getTotalHits, getUptimePct } from '../../services/analytics.ts';
import { readSiteMetadata } from '../../services/sites-folder.ts';

type SiteEntry = { domain: string; enabled: boolean; hits: number; uptime: number | undefined; accent?: string };

async function buildEntry(domain: string): Promise<SiteEntry> {
  const data = await readSiteMetadata(domain);
  if (!data) {
    return {
      domain,
      enabled: false,
      hits: getTotalHits(domain),
      uptime: getUptimePct(domain),
      accent: undefined,
    };
  }
  return {
    domain,
    enabled: data.enabled,
    hits: getTotalHits(domain),
    uptime: getUptimePct(domain),
    accent: data.accent,
  };
}

export async function listSites(): Promise<Response> {
  const domains = await listDomains();
  const sitePromises = domains.map(buildEntry);
  const sites = await Promise.all(sitePromises);
  return json({ sites });
}
