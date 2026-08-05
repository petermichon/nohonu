// Custom domain registry cache: Map<customDomain, internalDomain>
let customDomainCache: Map<string, string> | null = null;

export function getCachedCustomDomains(): Map<string, string> | null {
  return customDomainCache;
}

export function setCachedCustomDomains(value: Map<string, string> | null): void {
  customDomainCache = value;
}
