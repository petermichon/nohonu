import { SLOT_MS, recordUptime } from './analytics.ts';
import { listDomains } from './sites-folder.ts';
import { SITES_DIR } from '../shared/paths.ts';

async function getSitesList(): Promise<{ domain: string }[]> {
  const domains = await listDomains();
  return domains.map((domain) => ({ domain }));
}

async function checkSiteUptime(domain: string): Promise<boolean> {
  try {
    const content = await Deno.readTextFile(`${SITES_DIR}/${domain}.json`);
    const data = JSON.parse(content) as { enabled?: boolean };
    return data.enabled ?? true;
  } catch {
    return true;
  }
}

async function checkAndRecord(domain: string): Promise<void> {
  const up = await checkSiteUptime(domain);
  recordUptime(domain, up);
}

async function runUptimeChecks(): Promise<void> {
  const sites = await getSitesList();
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
