import { SLOT_MS, saveAnalytics, recordUptime } from './src/core/analytics/metrics.ts';
import * as sites from './src/usecases/sites/index.ts';

async function checkAndRecord(domain: string): Promise<void> {
  const status = await sites.checkSite(domain);
  recordUptime(domain, status.enabled);
}

async function runUptimeChecks(): Promise<void> {
  const siteList = await sites.listSites();
  const checks = siteList.map(({ domain }) => checkAndRecord(domain));
  await Promise.all(checks);
}

export function scheduleUptimeChecks(): void {
  const msToNextMinute = SLOT_MS - (Date.now() % SLOT_MS);
  setTimeout(() => {
    runUptimeChecks();
    setInterval(runUptimeChecks, SLOT_MS);
  }, msToNextMinute);
  const FLUSH_INTERVAL_MS = 5 * SLOT_MS;
  setInterval(saveAnalytics, FLUSH_INTERVAL_MS);
}
