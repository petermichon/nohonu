import { extractedDir } from './extracted-dir.ts';

export function extractedFilePath(user: string, domain: string, filePath: string): string {
  const cleanPath = filePath.replace(/^\/+/, '');
  const dir = extractedDir(user, domain);
  return `${dir}/${cleanPath}`.replace(/\/+/g, '/');
}
