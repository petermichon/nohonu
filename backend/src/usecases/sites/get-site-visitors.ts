import * as analytics from '../../core/analytics/metrics.ts';


export function getSiteVisitors(domain: string): { ip: string; count: number; last: number }[] {
  return analytics.getVisitors(domain);
}


