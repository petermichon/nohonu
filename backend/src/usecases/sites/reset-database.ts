import * as analytics from '../../core/analytics/metrics.ts';
import * as storage from '../../core/sites/storage.ts';
import { invalidateCustomDomainCache } from '../../core/sites/custom-domains-cache.ts';


export async function resetDatabase(): Promise<void> {
  await storage.resetStorage();
  analytics.resetAnalytics();
  invalidateCustomDomainCache();
}


