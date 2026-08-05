import { setCachedCustomDomains } from './custom-domain-cache-state.ts';

export function invalidateCustomDomainCache(): void {
  setCachedCustomDomains(null);
}
