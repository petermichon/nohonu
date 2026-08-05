import { getUptime } from '../../core/analytics/get-uptime.ts';


export function getSiteUptime(domain: string, slots: number, groupMinutes = 1): { slot: number; up: boolean | undefined }[] {
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof slots === 'number' && !isNaN(slots) && slots > 0, 'slots must be a positive number');
  console.assert(
    typeof groupMinutes === 'number' && !isNaN(groupMinutes) && groupMinutes > 0,
    'groupMinutes must be a positive number',
  );
  return getUptime(domain, slots, groupMinutes);
}
