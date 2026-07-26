import { SLOT_MS, saveAnalytics, recordUptime } from './core/analytics/metrics.ts';
import * as sites from './usecases/sites/index.ts';

async function checkAndRecord(user: string, domain: string): Promise<void> {
  const status = await sites.checkSite(user, domain);
  recordUptime(domain, status.enabled);
}

async function runUptimeChecks(): Promise<void> {
  const siteList = await sites.listAllSites();
  const checks = siteList.map(({ user, domain }) => checkAndRecord(user, domain));
  await Promise.all(checks);
}

async function flushAnalytics(): Promise<void> {
  const siteList = await sites.listAllSites();
  for (const { user, domain } of siteList) {
    await saveAnalytics(user, domain);
  }
}

export function scheduleUptimeChecks(): void {
  const msToNextMinute = SLOT_MS - (Date.now() % SLOT_MS);
  setTimeout(() => {
    runUptimeChecks();
    setInterval(runUptimeChecks, SLOT_MS);
  }, msToNextMinute);
  const FLUSH_INTERVAL_MS = 5 * SLOT_MS;
  setInterval(flushAnalytics, FLUSH_INTERVAL_MS);
}
