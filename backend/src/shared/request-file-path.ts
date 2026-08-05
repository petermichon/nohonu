export function requestFilePath(path: string): string {
  return path === '/' ? '/index.html' : path;
}
