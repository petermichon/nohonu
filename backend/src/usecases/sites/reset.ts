import * as storage from '../../core/sites/storage.ts';
import { resetAnalytics } from './analytics.ts';
import { invalidateCustomDomainCache } from './custom-domains.ts';

export async function resetDatabase(): Promise<void> {
  await storage.resetStorage();
  resetAnalytics();
  invalidateCustomDomainCache();
}
