import { domainDir } from '../../shared/paths.ts';

export function versionsDir(user: string, domain: string): string {
  return `${domainDir(user, domain)}/versions`;
}

export function versionPath(user: string, domain: string, index: number): string {
  return `${versionsDir(user, domain)}/${index}.zip`;
}

export function extractedDir(user: string, domain: string): string {
  return `${domainDir(user, domain)}/extracted`;
}

export function extractedFilePath(user: string, domain: string, filePath: string): string {
  const cleanPath = filePath.replace(/^\/+/, '');
  const dir = extractedDir(user, domain);
  return `${dir}/${cleanPath}`.replace(/\/+/g, '/');
}
