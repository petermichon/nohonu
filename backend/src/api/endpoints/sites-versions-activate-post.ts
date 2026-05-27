import { error, json } from '../../shared/http.ts';
import { SITES_DIR, fileExists, getCurrentVersionPath } from '../../shared/paths.ts';
import type { RouteContext } from './sites-types.ts';

export async function activateVersion({ domain, timestamp }: RouteContext): Promise<Response> {
  if (!timestamp || isNaN(timestamp)) {
    return error('Invalid timestamp');
  }
  const targetPath = `${SITES_DIR}/${domain}@${timestamp}.zip`;
  if (!(await fileExists(targetPath))) {
    return error('Version not found', 404);
  }

  for (const enabled of [true, false]) {
    const p = getCurrentVersionPath(domain, enabled);
    let stat: Deno.FileInfo | undefined;
    try {
      stat = await Deno.stat(p);
    } catch {
      /* file does not exist */
    }
    if (stat) {
      const mtime = stat.mtime?.getTime();
      let ts: number;
      if (mtime !== undefined) {
        ts = mtime;
      } else {
        ts = Date.now();
      }
      await Deno.rename(p, `${SITES_DIR}/${domain}@${ts}.zip`);
    }
  }
  await Deno.rename(targetPath, getCurrentVersionPath(domain, true));
  try {
    await Deno.remove(`${SITES_DIR}/${domain}`, { recursive: true });
  } catch {
    /* already gone */
  }
  return json({ success: true, domain, timestamp });
}
