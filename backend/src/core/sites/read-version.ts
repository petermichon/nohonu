import { versionPath } from '../../shared/paths.ts';

import * as fs from 'node:fs/promises';


export async function readVersion(user: string, domain: string, index: number): Promise<Uint8Array> {
  return await fs.readFile(versionPath(user, domain, index));
}
