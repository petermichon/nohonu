import { SLOT_MS } from './config.ts';
import { checkSite } from './usecases/sites/check-site.ts';
import { listAllSites } from './usecases/sites/list-all-sites.ts';
import { recordUptime } from './usecases/sites/record-uptime.ts';
import { saveAnalytics } from './usecases/sites/save-analytics.ts';
import { cleanupExpiredSessions } from './usecases/auth/cleanup-expired-sessions.ts';

async function checkAndRecord(user: string, siteId: string): Promise<void> {
  const status = await checkSite(user, siteId);
  recordUptime(user, siteId, status.enabled);
}

async function runUptimeChecks(): Promise<void> {
  const siteList = await listAllSites();
  const checks = siteList.map(({ user, siteId }) => checkAndRecord(user, siteId));
  await Promise.all(checks);
}

async function flushAnalytics(): Promise<void> {
  const siteList = await listAllSites();
  for (const { user, siteId } of siteList) {
    await saveAnalytics(user, siteId);
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
