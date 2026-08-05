import { requestFilePath } from './request-file-path.ts';

export function splitSitePath(path: string): { domain: string | undefined; filePath: string } {
  if (path === '/') return { domain: undefined, filePath: requestFilePath(path) };
  const parts = path.split('/').filter(Boolean);
  const domain = parts[0];
  const rest = parts.slice(1).join('/');
  return { domain, filePath: rest !== '' ? '/' + rest : '/index.html' };
}
