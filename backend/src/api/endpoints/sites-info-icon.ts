import { CORS } from '../../shared/http.ts';
import { readSiteMetadata, readActiveVersion } from '../../services/sites-folder.ts';
import { readZip } from '../../shared/zip.ts';
import type { RouteContext } from './sites-types.ts';

const FAVICON_CANDIDATES: { name: string; type: string }[] = [
  { name: 'favicon.ico', type: 'image/x-icon' },
  { name: 'favicon.png', type: 'image/png' },
  { name: 'favicon.svg', type: 'image/svg+xml' },
];

export async function getSiteIcon({ domain }: RouteContext): Promise<Response> {
  const data = await readSiteMetadata(domain);
  if (!data || !data.enabled || data.currentIndex === null) {
    return new Response(undefined, { status: 404, headers: CORS });
  }

  const zipData = await readActiveVersion(domain);
  if (!zipData) {
    return new Response(undefined, { status: 404, headers: CORS });
  }
  const files = await readZip(zipData);
  if (!files) {
    return new Response(undefined, { status: 404, headers: CORS });
  }

  for (const { name, type } of FAVICON_CANDIDATES) {
    const fileData = files[name];
    if (fileData && fileData.length > 0) {
      const headers = { ...CORS, 'Content-Type': type, 'Cache-Control': 'public, max-age=300' };
      return new Response(fileData.buffer as ArrayBuffer, { headers });
    }
  }

  return new Response(undefined, { status: 404, headers: CORS });
}
