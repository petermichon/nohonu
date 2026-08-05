import { getVisitors } from '../../core/analytics/get-visitors.ts';


export function getSiteVisitors(domain: string): { ip: string; count: number; last: number }[] {
  return getVisitors(domain);
}
