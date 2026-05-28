import { SLOT_MS, recordUptime } from './analytics.ts';
import { SITES_DIR } from '../shared/paths.ts';
import { loadSiteData } from './meta.ts';

export async function checkSiteUptime(domain: string): Promise<boolean> {
  const data = await loadSiteData(domain);
  return data.enabled;
}

async function listSites(): Promise<{ domain: string }[]> {
  const sites: { domain: string }[] = [];
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.name.endsWith('.json') && !entry.name.includes('@')) {
        sites.push({ domain: entry.name.slice(0, -'.json'.length) });
      }
    }
  } catch {
    /* no dir */
  }
  return sites;
}

async function checkAndRecord(domain: string): Promise<void> {
  const up = await checkSiteUptime(domain);
  recordUptime(domain, up);
}

async function runUptimeChecks(): Promise<void> {
  const sites = await listSites();
  const checks = sites.map(({ domain }) => {
    return checkAndRecord(domain);
  });
  await Promise.all(checks);
}

export function scheduleUptimeChecks(): void {
  const msToNextMinute = SLOT_MS - (Date.now() % SLOT_MS);
  setTimeout(() => {
    runUptimeChecks();
    setInterval(runUptimeChecks, SLOT_MS);
  }, msToNextMinute);
}
