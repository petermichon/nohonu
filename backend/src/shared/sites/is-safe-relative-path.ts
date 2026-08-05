export function isSafeRelativePath(path: string): boolean {
  return !path.includes('..') && !path.startsWith('/');
}
