import * as analytics from '../../core/analytics/metrics.ts';


export function recordUptime(domain: string, up: boolean): void {
  analytics.recordUptime(domain, up);
}


