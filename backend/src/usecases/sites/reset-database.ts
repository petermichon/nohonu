import { resetStorage } from '../../core/sites/reset-storage.ts';
import * as analytics from '../../core/analytics/metrics.ts';
import { invalidateCustomDomainCache } from '../../core/sites/custom-domains-cache.ts';


export async function resetDatabase(): Promise<void> {
  await resetStorage();
  analytics.resetAnalytics();
  invalidateCustomDomainCache();
}


