import { json } from '../../shared/http.ts';
import { SITES_DIR, getCurrentVersionPath, getMetaPath, getRepoHistoryPath } from '../../shared/paths.ts';
import { hits, visitors, uptime } from '../../services/analytics.ts';
import type { RouteContext } from './sites-types.ts';

export async function deleteSite({ domain }: RouteContext): Promise<Response> {
  const siteDir = `${SITES_DIR}/${domain}`;
  const prefix = `${domain}@`;

  for (const enabled of [true, false]) {
    try {
      await Deno.remove(getCurrentVersionPath(domain, enabled));
    } catch {
      /* already gone */
    }
  }
  let entries: Deno.DirEntry[] = [];
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      entries.push(entry);
    }
  } catch {
    entries = [];
  }
  for (const entry of entries) {
    if (entry.name.startsWith(prefix) && (entry.name.endsWith('.zip') || entry.name.endsWith('.json'))) {
      try {
        await Deno.remove(`${SITES_DIR}/${entry.name}`);
      } catch {
        /* already gone */
      }
    }
  }
  try {
    await Deno.remove(getMetaPath(domain));
  } catch {
    /* already gone */
  }
  try {
    await Deno.remove(getRepoHistoryPath(domain));
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
