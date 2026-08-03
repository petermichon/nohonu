import * as analytics from '../../core/analytics/metrics.ts';

export function getSiteStats(domain: string, slots: number, groupMinutes = 1): { slot: number; count: number }[] {
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof slots === 'number' && !isNaN(slots) && slots > 0, 'slots must be a positive number');
  console.assert(
    typeof groupMinutes === 'number' && !isNaN(groupMinutes) && groupMinutes > 0,
    'groupMinutes must be a positive number',
  );
  return analytics.getStats(domain, slots, groupMinutes);
}

export function getSiteVisitors(domain: string): { ip: string; count: number; last: number }[] {
  return analytics.getVisitors(domain);
}

export function getSiteUptime(domain: string, slots: number, groupMinutes = 1): { slot: number; up: boolean | undefined }[] {
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof slots === 'number' && !isNaN(slots) && slots > 0, 'slots must be a positive number');
  console.assert(
    typeof groupMinutes === 'number' && !isNaN(groupMinutes) && groupMinutes > 0,
    'groupMinutes must be a positive number',
  );
  return analytics.getUptime(domain, slots, groupMinutes);
}

export function recordUptime(domain: string, up: boolean): void {
  analytics.recordUptime(domain, up);
}

export async function saveAnalytics(user: string, domain: string): Promise<void> {
  await analytics.saveAnalytics(user, domain);
}

export async function loadAnalytics(user: string, domain: string): Promise<void> {
  await analytics.loadAnalytics(user, domain);
}

export function resetAnalytics(): void {
  analytics.resetAnalytics();
}
