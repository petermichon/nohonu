import { error, json } from '../../shared/http.ts';
import { versionExists, openVersion, readSiteMetadata, versionPath } from '../../services/sites-folder.ts';
import type { RouteContext } from './sites-types.ts';

export async function getSiteVersions({ domain, timestamp: index, subAction }: RouteContext): Promise<Response> {
  if (index && subAction === 'download') {
    if (!(await versionExists(domain, index))) {
      return error('Version not found', 404);
    }
    const file = await openVersion(domain, index);
    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${domain}-${index}.zip"`,
    };
    return new Response(file.readable, { headers });
  }

  const data = await readSiteMetadata(domain);
  if (!data) {
    return json({ domain, versions: [], current: null });
  }

  const versions: {
    index: number;
    size: number;
    source: import('../../shared/paths.ts').VersionSource;
    createdAt: number;
  }[] = [];

  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    try {
      const stat = await Deno.stat(versionPath(domain, index));
      versions.push({ index, size: stat.size, source: entry.source, createdAt: entry.createdAt });
    } catch {
      /* file missing, skip */
    }
  }

  versions.sort((a, b) => b.index - a.index);
  return json({ domain, versions, current: data.currentIndex });
}
