import { recordHit } from '../../core/sites/record-hit.ts';
import { resolveDomainAndServe } from '../../core/sites/resolve-domain-and-serve.ts';
import { serveSiteFile } from '../../core/sites/serve-site-file.ts';

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
    recordHit(resolved.domain, ip);
  }
  return result;
}
