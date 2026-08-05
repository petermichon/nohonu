import { SITES_DIR } from '../../config.ts';
import { user } from '../../db/user.ts';
import { hits, uptime, visitors } from '../../memory.ts';

import * as fs from 'node:fs/promises';




export async function resetDatabase(): Promise<void> {
  await user.deleteMany();
  await fs.rm(SITES_DIR, { recursive: true, force: true });
  await fs.mkdir(SITES_DIR, { recursive: true });
  hits.clear();
  visitors.clear();
  uptime.clear();
}
