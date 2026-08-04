import * as fs from 'node:fs/promises';
import { versionPath } from './version-path.ts';

export async function readVersion(user: string, domain: string, index: number): Promise<Uint8Array> {
  return await fs.readFile(versionPath(user, domain, index));
}
