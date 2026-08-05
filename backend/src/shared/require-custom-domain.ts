import { VALID_CUSTOM_DOMAIN, MAX_CUSTOM_DOMAIN_LENGTH } from './node/paths.ts';

export function requireCustomDomain(customDomain: string | undefined): string | undefined {
  if (!customDomain) return;
  if (customDomain.length > MAX_CUSTOM_DOMAIN_LENGTH || !VALID_CUSTOM_DOMAIN.test(customDomain)) return;
  return customDomain;
}
