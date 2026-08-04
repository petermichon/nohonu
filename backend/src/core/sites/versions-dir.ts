import { domainDir } from '../../shared/paths.ts';

export function versionsDir(user: string, domain: string): string {
  return `${domainDir(user, domain)}/versions`;
}
