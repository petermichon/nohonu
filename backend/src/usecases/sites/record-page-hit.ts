import * as analytics from '../../core/analytics/metrics.ts';


export function recordPageHit(domain: string, ip: string): void {
  analytics.recordHit(domain, ip);
}


