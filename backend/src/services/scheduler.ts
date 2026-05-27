import { SLOT_MS, recordUptime } from './analytics.ts';
import { SITES_DIR, getCurrentVersionPath } from '../shared/paths.ts';
import { resolveZipPath } from './versions.ts';

export async function checkSiteUptime(domain: string): Promise<boolean> {
  const zipPath = await resolveZipPath(domain);
  if (!zipPath) {
    return false;
  }
  const currentPath = getCurrentVersionPath(domain, true);
  return zipPath === currentPath;
}

async function listSites(): Promise<{ domain: string }[]> {
  const sites: { domain: string }[] = [];
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.name.includes('@')) {
        continue;
      }
      const disabled = entry.name.endsWith('.zip.disabled');
      if (disabled || entry.name.endsWith('.zip')) {
        let suffixLength: number;
        if (disabled) {
          suffixLength = -'.zip.disabled'.length;
        } else {
          suffixLength = -'.zip'.length;
        }
        const domain = entry.name.slice(0, suffixLength);
        sites.push({ domain });
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
