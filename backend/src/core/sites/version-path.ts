import { versionsDir } from './versions-dir.ts';

export function versionPath(user: string, domain: string, index: number): string {
  return `${versionsDir(user, domain)}/${index}.zip`;
}
