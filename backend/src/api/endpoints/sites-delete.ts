import { json } from '../../shared/http.ts';
import { SITES_DIR, getSiteDataPath } from '../../shared/paths.ts';
import { hits, visitors, uptime } from '../../services/analytics.ts';
import type { RouteContext } from './sites-types.ts';

export async function deleteSite({ domain }: RouteContext): Promise<Response> {
  const siteDir = `${SITES_DIR}/${domain}`;
  const prefix = `${domain}@`;

  let entries: Deno.DirEntry[] = [];
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      entries.push(entry);
    }
  } catch {
    entries = [];
  }
  for (const entry of entries) {
    if (entry.name.startsWith(prefix) && entry.name.endsWith('.zip')) {
      try {
        await Deno.remove(`${SITES_DIR}/${entry.name}`);
      } catch {
        /* already gone */
      }
    }
  }

  try {
    await Deno.remove(getSiteDataPath(domain));
  } catch {
    /* already gone */
  }
  try {
    await Deno.remove(siteDir, { recursive: true });
  } catch {
    /* already gone */
  }

  hits.delete(domain);
  visitors.delete(domain);
  uptime.delete(domain);
  return json({ success: true, domain });
}
