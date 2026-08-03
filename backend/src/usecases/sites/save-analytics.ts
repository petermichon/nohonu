import * as analytics from '../../core/analytics/metrics.ts';


export async function saveAnalytics(user: string, domain: string): Promise<void> {
  await analytics.saveAnalytics(user, domain);
}


