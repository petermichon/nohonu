import { SLOT_MS } from './config.ts';
import * as sites from './usecases/sites/index.ts';
import { cleanupExpiredSessions } from './usecases/auth/cleanup-expired-sessions.ts';

async function checkAndRecord(user: string, domain: string): Promise<void> {
  const status = await sites.checkSite(user, domain);
  sites.recordUptime(domain, status.enabled);
}

async function runUptimeChecks(): Promise<void> {
  const siteList = await sites.listAllSites();
  const checks = siteList.map(({ user, domain }) => checkAndRecord(user, domain));
  await Promise.all(checks);
}

async function flushAnalytics(): Promise<void> {
  const siteList = await sites.listAllSites();
  for (const { user, domain } of siteList) {
    await sites.saveAnalytics(user, domain);
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
  const DAY_MS = 24 * 60 * 60 * 1000;
  cleanupExpiredSessions();
  setInterval(cleanupExpiredSessions, DAY_MS);
}
