import { json } from '../../shared/http.ts';
import { SITES_DIR } from '../../shared/paths.ts';
import { getTotalHits, getUptimePct } from '../../services/analytics.ts';
import { loadMeta } from '../../services/meta.ts';

type SiteEntry = { domain: string; enabled: boolean; hits: number; uptime: number | undefined; accent?: string };

async function buildEntry(name: string): Promise<SiteEntry> {
  const disabled = name.endsWith('.zip.disabled');
  let domain: string;
  if (disabled) {
    domain = name.slice(0, -'.zip.disabled'.length);
  } else {
    domain = name.slice(0, -'.zip'.length);
  }
  const meta = await loadMeta(domain);
  return {
    domain,
    enabled: !disabled,
    hits: getTotalHits(domain),
    uptime: getUptimePct(domain),
    accent: meta.accent,
  };
}

export async function listSites(): Promise<Response> {
  const entries: string[] = [];
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.name.includes('@')) {
        continue;
      }
      if (entry.name.endsWith('.zip') || entry.name.endsWith('.zip.disabled')) {
        entries.push(entry.name);
      }
    }
  } catch {
    return json({ sites: [] });
  }
  const sitePromises = entries.map(buildEntry);
  const sites = await Promise.all(sitePromises);
  return json({ sites });
}
