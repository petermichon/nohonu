import * as fs from 'node:fs/promises';
import { versionPath } from './version-path.ts';

export async function openVersion(user: string, domain: string, index: number): Promise<fs.FileHandle> {
  return await fs.open(versionPath(user, domain, index));
}
