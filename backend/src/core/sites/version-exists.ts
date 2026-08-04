import * as fs from 'node:fs/promises';
import { versionPath } from './version-path.ts';

export async function versionExists(user: string, domain: string, index: number): Promise<boolean> {
  try {
    await fs.stat(versionPath(user, domain, index));
    return true;
  } catch {
    return false;
  }
}
