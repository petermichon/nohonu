import { domainDir } from '../../shared/paths.ts';

export function extractedDir(user: string, domain: string): string {
  return `${domainDir(user, domain)}/extracted`;
}
