import { requestFilePath } from './request-file-path.ts';

export function splitSitePath(path: string): { siteId: string | undefined; filePath: string } {
  if (path === '/') return { siteId: undefined, filePath: requestFilePath(path) };
  const parts = path.split('/').filter(Boolean);
  const siteId = parts[0];
  const rest = parts.slice(1).join('/');
  return { siteId, filePath: rest !== '' ? '/' + rest : '/index.html' };
}
