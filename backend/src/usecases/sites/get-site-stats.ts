import { getStats } from '../../core/analytics/get-stats.ts';


export function getSiteStats(domain: string, slots: number, groupMinutes = 1): { slot: number; count: number }[] {
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof slots === 'number' && !isNaN(slots) && slots > 0, 'slots must be a positive number');
  console.assert(
    typeof groupMinutes === 'number' && !isNaN(groupMinutes) && groupMinutes > 0,
    'groupMinutes must be a positive number',
  );
  return getStats(domain, slots, groupMinutes);
}
