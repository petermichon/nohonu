import * as analytics from '../../core/analytics/metrics.ts';


export async function loadAnalytics(user: string, domain: string): Promise<void> {
  await analytics.loadAnalytics(user, domain);
}


