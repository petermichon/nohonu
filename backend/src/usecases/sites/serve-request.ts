import { recordPageHit } from './record-page-hit.ts';
import { resolveDomainAndServe } from './resolve-domain-and-serve.ts';
import { serveSiteFile } from './serve-site-file.ts';

export async function serveRequest(
  host: string,
  path: string,
  ip: string,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const resolved = await resolveDomainAndServe(host, path);
  if (!resolved) return null;

  const result = await serveSiteFile(resolved.user, resolved.domain, resolved.filePath);
  if (!result) return null;

  if (result.contentType === 'text/html') {
    recordPageHit(resolved.domain, ip);
  }
  return result;
}
