import type { VersionSource } from '../paths.ts';

export function toVersionSourceData(source: VersionSource): {
  type: string;
  repo: string | null;
  branch: string | null;
} {
  const data: { type: string; repo: string | null; branch: string | null } = {
    type: source.type,
    repo: null,
    branch: null,
  };
  if (source.type === 'github') {
    data.repo = source.repo;
    data.branch = source.branch;
  }
  return data;
}
