import type { VersionSource } from './paths.ts';

export interface VersionInfo {
  index: number;
  size: number;
  source: VersionSource;
  createdAt: number;
}
