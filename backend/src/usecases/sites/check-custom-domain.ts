import { getCustomDomainCache } from '../../core/sites/custom-domains-cache.ts';


export async function checkCustomDomain(customDomain: string): Promise<boolean> {
  const cache = await getCustomDomainCache();
  return cache.has(customDomain);
}
