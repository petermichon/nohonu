import { versionPath } from '../../shared/paths.ts';

import * as fs from 'node:fs/promises';


export async function openVersion(user: string, domain: string, index: number): Promise<fs.FileHandle> {
  return await fs.open(versionPath(user, domain, index));
}
