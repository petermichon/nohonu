export function stripCommonRoot(files: Record<string, Uint8Array>): Record<string, Uint8Array> | null {
  const paths = Object.keys(files);
  if (paths.length > 0) {
    const firstPath = paths[0];
    if (!firstPath) return null;
    const firstSlashIndex = firstPath.indexOf('/');
    if (firstSlashIndex !== -1) {
      const commonRoot = firstPath.substring(0, firstSlashIndex + 1);
      if (paths.every((p) => p.startsWith(commonRoot))) {
        const stripped: Record<string, Uint8Array> = {};
        for (const [path, data] of Object.entries(files)) {
          const strippedPath = path.substring(commonRoot.length);
          if (strippedPath) {
            stripped[strippedPath] = data;
          }
        }
        return stripped;
      }
    }
  }
  return files;
}
