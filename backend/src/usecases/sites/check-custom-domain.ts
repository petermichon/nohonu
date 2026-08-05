import { getCustomDomainCache } from '../../core/sites/get-custom-domain-cache.ts';


export async function checkCustomDomain(customDomain: string): Promise<boolean> {
  const cache = await getCustomDomainCache();
  return cache.has(customDomain);
}
