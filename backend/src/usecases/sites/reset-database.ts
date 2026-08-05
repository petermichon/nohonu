import { SITES_DIR } from '../../config.ts';
import { db } from '../../db.ts';
import { hits, uptime, visitors } from '../../memory.ts';

import * as fs from 'node:fs/promises';




export async function resetDatabase(): Promise<void> {
  await db.user.deleteMany();
  await fs.rm(SITES_DIR, { recursive: true, force: true });
  await fs.mkdir(SITES_DIR, { recursive: true });
  hits.clear();
  visitors.clear();
  uptime.clear();
}
