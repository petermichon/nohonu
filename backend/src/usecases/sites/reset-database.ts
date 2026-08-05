import { hits } from '../../memory/hits.ts';
import { visitors } from '../../memory/visitors.ts';
import { uptime } from '../../memory/uptime.ts';
import { SITES_DIR } from '../../config.ts';
import { user } from '../../db/user.ts';

import * as fs from 'node:fs/promises';




export async function resetDatabase(): Promise<void> {
  await user.deleteMany();
  await fs.rm(SITES_DIR, { recursive: true, force: true });
  await fs.mkdir(SITES_DIR, { recursive: true });
  hits.clear();
  visitors.clear();
  uptime.clear();
}
