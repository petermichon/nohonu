import * as fs from 'node:fs/promises';
import { SITES_DIR } from '../../shared/paths.ts';

export async function probeStorage(): Promise<'ok' | 'error'> {
  const probe = `${SITES_DIR}/.health`;
  try {
    await fs.writeFile(probe, '1');
    await fs.readFile(probe, 'utf-8');
    await fs.rm(probe, { force: true });
    return 'ok';
  } catch {
    return 'error';
  }
}
