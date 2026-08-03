import * as storage from '../../core/sites/storage.ts';
import { resetAnalytics } from './reset-analytics.ts';
import { invalidateCustomDomainCache } from './custom-domains-cache.ts';


export async function resetDatabase(): Promise<void> {
  await storage.resetStorage();
  resetAnalytics();
  invalidateCustomDomainCache();
}


